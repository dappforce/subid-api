import { CreatorStakingProps } from "."
import Cache from "../../cache"
import { ONE_HOUR } from "../../constant"

const stakingConstsCache = new Cache('creator-consts', ONE_HOUR * 24)

export const getStakingConsts = async ({ apis }: CreatorStakingProps) => {
  const api = apis.subsocial

  if (!api) return undefined

  const needUpdate = stakingConstsCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheData = await stakingConstsCache.get()

  if (!cacheData || forceUpdate) {
    const unbondingPeriodInEras = api.consts.creatorStaking.unbondingPeriodInEras.toJSON()
    const minimumStakingAmount = api.consts.creatorStaking.minimumStakingAmount.toJSON()
    const minimumRemainingAmount = api.consts.creatorStaking.minimumRemainingAmount.toJSON()
    const maxNumberOfStakersPerCreator =
      api.consts.creatorStaking.maxNumberOfStakersPerCreator.toJSON()
    const maxEraStakeValues = api.consts.creatorStaking.maxEraStakeValues.toJSON()
    const currentAnnualInflation =
      api.consts.creatorStaking.currentAnnualInflation.toHuman() as string

    stakingConstsCache.set(undefined, {
      unbondingPeriodInEras,
      minimumStakingAmount,
      minimumRemainingAmount,
      maxNumberOfStakersPerCreator,
      maxEraStakeValues,
      currentAnnualInflation: currentAnnualInflation.replace('%', '')
    })
  }

  return stakingConstsCache.get()
}