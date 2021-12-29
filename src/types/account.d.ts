interface AccountValue {
  address: string
  coins: Coins
  public_key: { type: string; value: string }
  account_number: string
  sequence: string
}

interface StandardAccount {
  type: string
  value: AccountValue
}

interface VestingAccount {
  type: string
  value: {
    BaseVestingAccount: {
      BaseAccount: AccountValue
      original_vesting: Coins
      delegated_free: Coins
      delegated_vesting: Coins
      end_time: string
    }
    vesting_schedules: {
      denom: string
      schedules: {
        cliff: string
        ratio: string
      }[]
    }[]
  }
}

interface Columbus3LazyVestingAccount {
  type: string
  value: {
    BaseVestingAccount: {
      BaseAccount: AccountValue
      original_vesting: Coins
      delegated_free: Coins
      delegated_vesting: Coins
      end_time: string
    }
    vesting_schedules: VestingSchedules[]
  }
}

interface Columbus4LazyVestingAccount {
  type: string
  value: AccountValue & {
    original_vesting: Coins
    delegated_free: Coins
    delegated_vesting: Coins
    end_time: string
    vesting_schedules: VestingSchedules[]
  }
}

interface LazyVestingAccount {
  type: string
  value: {
    coins: Coins
    base_vesting_account: {
      base_account: AccountValue
      original_vesting: Coins
      delegated_free: Coins
      delegated_vesting: Coins
    }
    vesting_schedules: VestingSchedules[]
  }
}

interface VestingSchedules {
  denom: string
  schedules: Schedule[]
}

interface Schedule {
  start_time: string
  end_time: string
  ratio: string
}

interface Columbus3ModuleAccount {
  type: string
  value: {
    BaseAccount: AccountValue
    name: string
    permissions: string[]
  }
}

interface ModuleAccount {
  type: string
  value: AccountValue & {
    name: string
    permissions: string[]
  }
}

interface NormalizedAccount {
  value: AccountValue
  // For vesting accounts
  original_vesting?: Coins
  delegated_free?: Coins
  delegated_vesting?: Coins
  vesting_schedules?: VestingSchedules[]
  // For module accounts
  name?: string
  permissions?: string[]
}

interface CountInfoByDate {
  datetime: number // datetime in unix
  value: number
}

interface AccountCountInfo {
  datetime: number
  activeAccountCount: number
  totalAccountCount: number
}

interface AccountGrowthReturn {
  periodic: AccountCountInfo[]
  cumulative: AccountCountInfo[]
}

interface AccountStatReturn {
  total: number
  periodic: CountInfoByDate[]
  cumulative?: CountInfoByDate[]
}

interface BlockRewardSumInfo {
  datetime: number // datetiem in unix
  blockReward: string // big interger
}

interface BlockRewardsReturn {
  periodic: BlockRewardSumInfo[]
  cumulative: BlockRewardSumInfo[]
}
