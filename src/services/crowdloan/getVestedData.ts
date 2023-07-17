import { ApiPromise } from '@polkadot/api'
import type { PalletBalancesBalanceLock, PalletVestingVestingInfo } from '@polkadot/types/lookup'
import type {
  DeriveBalancesAccountData,
  DeriveBalancesAllAccountData,
  DeriveBalancesAll,
  DeriveBalancesAccount,
  DeriveBalancesAllVesting
} from '@polkadot/api-derive/types'
import { BN, bnMax, objectSpread, BN_ZERO, bnMin } from '@polkadot/util'
import type { Balance, BalanceLockTo212, BlockNumber } from '@polkadot/types/interfaces'

interface AllLocked {
  allLocked: boolean
  lockedBalance: Balance
  lockedBreakdown: (PalletBalancesBalanceLock | BalanceLockTo212)[]
  vestingLocked: Balance
}

const VESTING_ID = '0x76657374696e6720'

function calcLocked(
  api: ApiPromise,
  bestNumber: BlockNumber,
  locks: (PalletBalancesBalanceLock | BalanceLockTo212)[]
): AllLocked {
  let lockedBalance = api.registry.createType('Balance') as unknown as Balance
  let lockedBreakdown: (PalletBalancesBalanceLock | BalanceLockTo212)[] = []
  let vestingLocked = api.registry.createType('Balance') as unknown as Balance
  let allLocked = false

  if (Array.isArray(locks)) {
    // only get the locks that are valid until passed the current block
    lockedBreakdown = (locks as BalanceLockTo212[]).filter(
      ({ until }): boolean => !until || (bestNumber && until.gt(bestNumber))
    )
    allLocked = lockedBreakdown.some(({ amount }) => amount && amount.isMax())
    vestingLocked = api.registry.createType(
      'Balance',
      lockedBreakdown
        .filter(({ id }) => id.eq(VESTING_ID))
        .reduce((result: BN, { amount }) => result.iadd(amount), new BN(0))
    ) as unknown as Balance

    const notAll = lockedBreakdown.filter(({ amount }) => amount && !amount.isMax())

    if (notAll.length) {
      lockedBalance = api.registry.createType(
        'Balance',
        bnMax(...notAll.map(({ amount }): Balance => amount))
      ) as unknown as Balance
    }
  }

  return { allLocked, lockedBalance, lockedBreakdown, vestingLocked }
}

function calcShared(
  api: ApiPromise,
  bestNumber: BlockNumber,
  data: DeriveBalancesAccountData,
  locks: (PalletBalancesBalanceLock | BalanceLockTo212)[]
): DeriveBalancesAllAccountData {
  const { allLocked, lockedBalance, lockedBreakdown, vestingLocked } = calcLocked(
    api,
    bestNumber,
    locks
  )

  return objectSpread({}, data, {
    availableBalance: api.registry.createType(
      'Balance',
      allLocked
        ? 0
        : bnMax(new BN(0), data?.freeBalance ? data.freeBalance.sub(lockedBalance) : new BN(0))
    ),
    lockedBalance,
    lockedBreakdown,
    vestingLocked
  })
}

function calcVesting(
  bestNumber: BlockNumber,
  shared: DeriveBalancesAllAccountData,
  _vesting: PalletVestingVestingInfo[] | null
): DeriveBalancesAllVesting {
  const vesting = _vesting || []
  const isVesting = !shared.vestingLocked.isZero()
  const vestedBalances = vesting.map(({ locked, perBlock, startingBlock }) =>
    bestNumber.gt(startingBlock)
      ? bnMin(locked, perBlock.mul(bestNumber.sub(startingBlock)))
      : BN_ZERO
  )
  const vestedBalance = vestedBalances.reduce<BN>((all, value) => all.iadd(value), new BN(0))
  const vestingTotal = vesting.reduce<BN>((all, { locked }) => all.iadd(locked), new BN(0))

  return {
    isVesting,
    vestedBalance,
    vestedClaimable: isVesting
      ? shared.vestingLocked.sub(vestingTotal.sub(vestedBalance))
      : BN_ZERO,
    vesting: vesting
      .map(({ locked, perBlock, startingBlock }, index) => ({
        endBlock: locked.div(perBlock).iadd(startingBlock),
        locked,
        perBlock,
        startingBlock,
        vested: vestedBalances[index]
      }))
      .filter(({ locked }) => !locked.isZero()),
    vestingTotal
  }
}

type ResultBalance = [
  PalletVestingVestingInfo[] | null,
  (PalletBalancesBalanceLock | BalanceLockTo212)[]
]
type Result = [DeriveBalancesAccount, ResultBalance, BlockNumber]

function calcBalances(api: ApiPromise, result: Result): DeriveBalancesAll {
  const [data, [vesting, allLocks], bestNumber] = result
  const shared = calcShared(api, bestNumber, data, allLocks)

  return objectSpread(shared, calcVesting(bestNumber, shared, vesting))
}

type GetVestedDataParams = {
  api: ApiPromise
  account: string
}

const getVestedData = async ({ api, account }: GetVestedDataParams) => {
  const balanceByAccount: any = await api.derive.balances.account(account)

  const locks = await api.query.balances.locks(account)
  const vesting = await api.query.vesting?.vesting?.(account)
  const blockNumber = await api.query.system.number()

  const unwrappedVestingData = vesting?.unwrapOr(undefined) || []

  const params: Result = [balanceByAccount, [unwrappedVestingData, locks.toArray()], blockNumber]

  const result = calcBalances(api, params)

  return result
}

export default getVestedData
