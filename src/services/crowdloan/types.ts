import { polkadotParachains, kusamaParachains } from '../../connections/networks'
import { Network } from '../../connections/networks/types'
import type { DeriveBalancesAccount } from '@polkadot/api-derive/types'
import type { Balance, BalanceLockTo212, BlockNumber } from '@polkadot/types/interfaces'
import type { PalletBalancesBalanceLock, PalletVestingVestingInfo } from '@polkadot/types/lookup'

export type RelayChain = 'polkadot' | 'kusama'

export const parachainsTupleByRelayChain: Record<RelayChain, [string, Network][]> = {
  polkadot: Object.entries(polkadotParachains),
  kusama: Object.entries(kusamaParachains)
}

export const relayChains: RelayChain[] = ['polkadot', 'kusama']

export interface AllLocked {
  allLocked: boolean
  lockedBalance: Balance
  lockedBreakdown: (PalletBalancesBalanceLock | BalanceLockTo212)[]
  vestingLocked: Balance
}

type ResultBalance = [
  PalletVestingVestingInfo[] | null,
  (PalletBalancesBalanceLock | BalanceLockTo212)[]
]
export type Result = [DeriveBalancesAccount, ResultBalance, BlockNumber]
