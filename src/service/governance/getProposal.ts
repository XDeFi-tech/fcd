import { getRepository } from 'typeorm'
import { ValidatorInfoEntity, ProposalEntity } from 'orm'
import * as lcd from 'lib/lcd'
import { APIError, ErrorTypes } from 'lib/error'
import { getProposalBasic, ProposalStatus } from './helper'
import { generateValidatorResponse } from 'service/staking/helper'

interface ProposalPramsModuleSpace {
  subspace: string // module
  key: string // key name of the module
  value: string // proposed value of key
}

interface ProposalContent {
  key: string // content type like changes
  value: ProposalPramsModuleSpace[] | string // value m
}

interface GetProposalResponse extends ProposalBasic {
  tallyingParameters?: LcdProposalTallyingParams
  content?: ProposalContent[]
  validatorsNotVoted?: ValidatorResponse[]
}

function makeContentArray(contentObj: ProposalContentValue): ProposalContent[] {
  return Object.keys(contentObj)
    .filter((key) => key !== 'title' && key !== 'description')
    .map((key) => {
      return {
        key,
        value: contentObj[key]
      }
    })
}

async function getDelegatedValidatorWhoDidNotVoted(
  account: string,
  voters: { [operatorAddr: string]: string }
): Promise<ValidatorResponse[]> {
  const delegations = await lcd.getDelegations(account)

  if (!delegations || delegations.length === 0) {
    return []
  }

  const delegatedOperatorList: string[] = delegations.map(({ delegation: d }) => d.validator_address)

  const qb = getRepository(ValidatorInfoEntity)
    .createQueryBuilder('validator')
    .where('validator.operatorAddress IN (:...ids)', { ids: delegatedOperatorList })
    .andWhere('validator.status = (:status)', { status: 'active' })

  const delegatedValidator = await qb.getMany()
  const validatorNotVoted = delegatedValidator.filter((validator) => !voters[validator.accountAddress])

  return validatorNotVoted.map(generateValidatorResponse)
}

export default async function getProposal(proposalId: string, account?: string): Promise<GetProposalResponse> {
  const proposal = await getRepository(ProposalEntity).findOne({ proposalId })

  if (!proposal) {
    throw new APIError(ErrorTypes.NOT_FOUND_ERROR, '', 'Proposal not found')
  }

  const proposalBasic: ProposalBasic = await getProposalBasic(proposal)

  const content = makeContentArray(proposal.content.value)

  const tallyingParameters = proposal.tallyingParameters

  const proposalDetails = {
    ...proposalBasic,
    content,
    tallyingParameters
  }

  if (!account || proposalBasic.status !== ProposalStatus.VOTING) {
    return proposalDetails
  }

  return {
    ...proposalDetails,
    validatorsNotVoted: await getDelegatedValidatorWhoDidNotVoted(account, proposalBasic.vote?.voters || {})
  }
}
