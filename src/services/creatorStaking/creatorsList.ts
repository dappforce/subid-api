import { CreatorStakingProps } from "."
import Cache from "../../cache"
import { ONE_HOUR } from "../../constant"
import { parseStringValue } from "../utils"

type RegisteredStatus = 'Active' | 'Inactive'

type RegisteredCreator = {
  spaceId: string
  stakeholder: string
  status: RegisteredStatus
}

const creatorsListCache = new Cache('creators-list', ONE_HOUR)

export const getCreatorsList = async ({
  apis
}: CreatorStakingProps): Promise<RegisteredCreator[]> => {
  const api = apis.subsocial

  if (!api) return []

  const needUpdate = creatorsListCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheData = await creatorsListCache.get()

  if (!cacheData || forceUpdate) {
    const creatorsCodec = await api.query.creatorStaking.registeredCreators.entries()

    const creators = creatorsCodec.map(([key, value]) => {
      const spaceId = key.toHuman()[0] as string

      const creatorInfo = value.toHuman() as Omit<RegisteredCreator, 'spaceId'>

      return {
        spaceId: parseStringValue(spaceId),
        ...creatorInfo
      }
    })

    creatorsListCache.set(undefined, creators)
  }

  return creatorsListCache.get()
}