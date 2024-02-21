import { WithApis } from '../types'
import { isDef } from '@subsocial/utils'
import { rpcQuery } from '../rpc'

const subsocialRpcNode = 'https://para.subsocial.network'

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
  backerCount: string
}

export const getBackerCount = async ({ apis }: CreatorStakingProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const backersCount = await api.query.creatorStaking.backerStakesByCreator.keys()

  if(backersCount) {
    const backers = backersCount.map((key) => key.toHuman()[0]) as string[]
    const backersSet = new Set(backers)

    return backersSet.size.toString()
  }

  return undefined
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

  const backerCount = await getBackerCount({apis})

  return {
    currentEra: currentEraCodec.toPrimitive() as string,
    nextEraBlock: nextEraBlockCodec.toPrimitive() as string,
    backerCount,
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
    return [api.query.creatorStaking.backerStakesByCreator, [account, spaceId]]
  })

  const generalStakerInfoResult = await api.queryMulti(queryParams as any)

  const generalStakerInfo = {}

  spaceIds.forEach((id, index) => {
    const value = generalStakerInfoResult[index]?.toJSON() as any
    if (value || value !== null) {
      generalStakerInfo[id] = value.staked
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
    subsocialRpcNode,
    {
      moduleName: 'creatorStaking',
      method: 'estimatedBackerRewardsByCreator'
    },
    [account, spaceIdsArray]
  )

  const availableClaimResult = await rpcQuery(
    subsocialRpcNode,
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

  availableClaimResult?.forEach(([spaceId, claimCount]) => {
    if(rewardsBySpaceId[spaceId] === 0) return

    availableClaimsBySpaceId[spaceId] = claimCount
  })

  return { availableClaimsBySpaceId, rewardsBySpaceId }
}

type CreatorRewardsProps = {
  spaceId: string
}

export const getCreatorRewards = async ({ spaceId }: CreatorRewardsProps) => {
  const rewards = await rpcQuery(
    subsocialRpcNode,
    {
      moduleName: 'creatorStaking',
      method: 'estimatedCreatorRewards'
    },
    [parseInt(spaceId)]
  )

  const availableClaims = await rpcQuery(
    subsocialRpcNode,
    {
      moduleName: 'creatorStaking',
      method: 'availableClaimsByCreator'
    },
    [parseInt(spaceId)]
  )

  return { rewards, availableClaims }
}
