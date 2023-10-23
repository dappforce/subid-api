import { WithApis } from '../types'
import BN from 'bignumber.js'
import { isDef } from '@subsocial/utils'
import { subsocial } from '../../connections/networks'
import { rpcQuery } from '../rpc'

export type CreatorStakingProps = WithApis

type EraInfo = {
  rewards: {
    backers: string
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

  const blockPerEra = api.consts.creatorStaking.blockPerEra.toPrimitive()

  const eraInfo = await api.query.creatorStaking.generalEraInfo(currentEraCodec)

  return {
    currentEra: currentEraCodec.toPrimitive() as string,
    nextEraBlock: nextEraBlockCodec.toPrimitive() as string,
    blockPerEra: blockPerEra as string,
    ...(eraInfo.toJSON() as EraInfo)
  }
}

type CreatorsEraStakeProps = CreatorStakingProps & {
  era: string
  spaceIds: string[]
}

export const getCreatorsEraStake = async ({ apis, era, spaceIds }: CreatorsEraStakeProps) => {
  const api = apis.subsocial

  if (!api) return undefined


  const queryParams = spaceIds.map((spaceId) => {
    return [api.query.creatorStaking.creatorStakeInfoByEra, [spaceId, era]]
  })

  const eraStakesResult = await api.queryMulti(queryParams as any)

  const eraStakes = {}

  spaceIds.forEach((id, index) => {
    const value = eraStakesResult[index]?.toJSON()
    if (value) {
      eraStakes[id] = value
    }
  })

  return eraStakes
}

type GeneralStakerInfoProps = CreatorStakingProps & {
  account: string
  spaceIds: string[]
}

export const getGeneralBackerInfo = async ({ apis, spaceIds, account }: GeneralStakerInfoProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const queryParams = spaceIds.map((spaceId) => {
    return [api.query.creatorStaking.generalBackerInfo, [account, spaceId]]
  })

  const generalStakerInfoResult = await api.queryMulti(queryParams as any)

  const generalStakerInfo = {}

  spaceIds.forEach((id, index) => {
    const value = generalStakerInfoResult[index]?.toJSON() as any
    if (value || value !== null) {
      const stakes = value.stakes.sort((a, b) => new BN(b.era).minus(new BN(a.era)))

      generalStakerInfo[id] = stakes
    }
  })

  return generalStakerInfo
}

type BackerLedgerProps = CreatorStakingProps & {
  account: string
}

export const getBackerLocksByAccount = async ({ apis, account }: BackerLedgerProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const backerLedger = await api.query.creatorStaking.backerLocksByAccount(account)

  return backerLedger.toJSON()
}

type StakerRewardsProps = {
  account: string
  spaceIds: string[]
}

export const getBackerRewards = async ({ account, spaceIds }: StakerRewardsProps) => {
  const spaceIdsArray = spaceIds
    .filter(isDef)
    .map((id) => parseInt(id))

  const rewardsResult = await rpcQuery(
    subsocial.node,
    {
      moduleName: 'creatorStaking',
      method: 'estimatedBackerRewardsByCreator'
    },
    [account, spaceIdsArray]
  )

  const availableClaimResult = await rpcQuery(
    subsocial.node,
    {
      moduleName: 'creatorStaking',
      method: 'availableClaimsByBacker'
    },
    [account]
  )

  const rewardsBySpaceId = {}
  const availableClaimsBySpaceId = {}

  rewardsResult?.forEach((data) => {
    const [spaceId, rewards] = data

    rewardsBySpaceId[spaceId] = rewards
  })

  availableClaimResult.forEach(([spaceId, claimCount]) => {
    availableClaimsBySpaceId[spaceId] = claimCount
  })

  return { availableClaimsBySpaceId, rewardsBySpaceId }
}

type CreatorRewardsProps = {
  spaceId: string
}

export const getCreatorRewards = async ({ spaceId }: CreatorRewardsProps) => {
  const rewards = await rpcQuery(
    subsocial.node,
    {
      moduleName: 'creatorStaking',
      method: 'estimatedCreatorRewards'
    },
    [parseInt(spaceId)]
  )

  const availableClaims = await rpcQuery(
    subsocial.node,
    {
      moduleName: 'creatorStaking',
      method: 'availableClaimsByCreator'
    },
    [parseInt(spaceId)]
  )

  return { rewards, availableClaims }
}
