import { WithApis } from '../types'
import BN from 'bignumber.js'
import { isDef } from '@subsocial/utils'
import { subsocial } from '../../connections/networks'
import { rpcQuery } from '../rpc'

export type CreatorStakingProps = WithApis

type EraInfo = {
  rewards: {
    stakers: string
    creators: string
  }
  staked: string
  locked: string
}

type GeneralEraInfo = EraInfo & {
  currentEra: string
  nextEraBlock: string
  blockPerEra: string
}

export const getGeneralEraInfo = async ({
  apis
}: CreatorStakingProps): Promise<GeneralEraInfo | undefined> => {
  const api = apis.subsocial

  if (!api) return undefined

  const [currentEraCodec, nextEraBlockCodec] = await api.queryMulti([
    api.query.creatorStaking.currentEra,
    api.query.creatorStaking.nextEraStartingBlock
  ])

  const blockPerEra = api.consts.creatorStaking.blockPerEra.toJSON()

  const eraInfo = await api.query.creatorStaking.generalEraInfo(currentEraCodec)

  return {
    currentEra: currentEraCodec.toJSON() as string,
    nextEraBlock: nextEraBlockCodec.toJSON() as string,
    blockPerEra: blockPerEra as string,
    ...(eraInfo.toJSON() as EraInfo)
  }
}

type CreatorsEraStakeProps = CreatorStakingProps & {
  era: string
  spaceIds: string
}

export const getCreatorsEraStake = async ({ apis, era, spaceIds }: CreatorsEraStakeProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const ids = spaceIds.split(',')

  const queryParams = ids.map((spaceId) => {
    return [api.query.creatorStaking.creatorEraStake, [spaceId, era]]
  })

  const eraStakesResult = await api.queryMulti(queryParams as any)

  const eraStakes = {}

  ids.forEach((id, index) => {
    const value = eraStakesResult[index]?.toJSON()
    if (value || value !== null) {
      eraStakes[id] = value
    }
  })

  return eraStakes
}

type GeneralStakerInfoProps = CreatorStakingProps & {
  account: string
  spaceIds: string
}

export const getGeneralStakerInfo = async ({ apis, spaceIds, account }: GeneralStakerInfoProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const ids = spaceIds.split(',')

  const queryParams = ids.map((spaceId) => {
    return [api.query.creatorStaking.generalStakerInfo, [account, spaceId]]
  })

  const generalStakerInfoResult = await api.queryMulti(queryParams as any)

  const generalStakerInfo = {}

  ids.forEach((id, index) => {
    const value = generalStakerInfoResult[index]?.toJSON() as any
    if (value || value !== null) {
      const stakes = value.stakes.sort((a, b) => new BN(b.era).minus(new BN(a.era)))

      generalStakerInfo[id] = stakes
    }
  })

  return generalStakerInfo
}

type StakerLedgerProps = CreatorStakingProps & {
  account: string
}

export const getStakerLedger = async ({ apis, account }: StakerLedgerProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const stakerLedger = await api.query.creatorStaking.ledger(account)

  return stakerLedger.toJSON()
}

type StakerRewardsProps = {
  account: string
  spaceIds: string
}

export const getStakerRewards = async ({ account, spaceIds }: StakerRewardsProps) => {
  const spaceIdsArray = spaceIds
    .split(',')
    .filter(isDef)
    .map((id) => parseInt(id))

  const result = await rpcQuery(
    subsocial.node,
    {
      moduleName: 'creatorStaking',
      method: 'estimatedStakerRewardsByCreator'
    },
    [account, spaceIdsArray]
  )

  const rewardsBySpaceId = {}

  result?.forEach((data) => {
    const [spaceId, rewards] = data

    rewardsBySpaceId[spaceId] = rewards
  })

  return rewardsBySpaceId
}