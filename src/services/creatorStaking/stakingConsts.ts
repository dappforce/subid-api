import { CreatorStakingProps } from "."
import Cache from "../../cache"
import { FIVE_MINUTES } from "../../constant"

const stakingConstsCache = new Cache('creator-consts', FIVE_MINUTES)

export const getStakingConsts = async ({ apis }: CreatorStakingProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const needUpdate = stakingConstsCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheData = await stakingConstsCache.get()

  if (!cacheData || forceUpdate) {
    const unbondingPeriodInEras = api.consts.creatorStaking.unbondingPeriodInEras.toJSON()
    const minimumStakingAmount = api.consts.creatorStaking.minimumStake.toJSON()
    const minimumRemainingAmount = api.consts.creatorStaking.minimumRemainingFreeBalance.toJSON()
    const maxNumberOfStakersPerCreator =
      api.consts.creatorStaking.maxNumberOfBackersPerCreator.toJSON()
    const maxEraStakeValues = api.consts.creatorStaking.maxEraStakeItems.toJSON()
    const blocksPerEra = api.consts.creatorStaking.blockPerEra.toJSON()
    const currentAnnualInflation =
      api.consts.creatorStaking.annualInflation.toHuman() as string

    stakingConstsCache.set(undefined, {
      unbondingPeriodInEras,
      minimumStakingAmount,
      minimumRemainingAmount,
      maxNumberOfStakersPerCreator,
      maxEraStakeValues,
      blocksPerEra,
      currentAnnualInflation: currentAnnualInflation.replace('%', '')
    })
  }

  return stakingConstsCache.get()
}