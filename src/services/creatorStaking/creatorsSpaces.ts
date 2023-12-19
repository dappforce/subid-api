import { gql } from 'graphql-request'
import Cache from '../../cache'
import { FIVE_MINUTES } from '../../constant'
import { subsocialGraphQlClient } from '../../constant/graphQlClients'
import { isEmptyArray } from '@subsocial/utils'
import { Apis } from '../../connections/networks/types'
import { runQueryOrUndefined } from '../utils'

const creatorsSpacesCache = new Cache('creators-spaces', FIVE_MINUTES)

type CreatorsSpacesInfo = {
  spaceIds: string[]
  apis: Apis
}

export const GET_CREATORS_SPACES = gql`
  query getCreatorsSpaces($ids: [String!]) {
    spaces(where: { id_in: $ids, hidden_eq: false }) {
      id
      image
      hidden
      name
      about
      email
      postsCount
      linksOriginal
      ownedByAccount {
        id
      }
    }
  }
`

export const getCreatorsSpacesInfo = async ({ apis, spaceIds }: CreatorsSpacesInfo) => {
  const cacheData = (await creatorsSpacesCache.getAllValues(spaceIds)) as any[]
  const needUpdate = creatorsSpacesCache.needUpdate
  const forceUpdate = needUpdate && (await needUpdate())

  const subsocial = apis.subsocial

  const cacheDataKeys = cacheData ? Object.keys(cacheData) : []

  const needUpdateSpaceIds = spaceIds.filter((spaceId) => !cacheDataKeys.includes(spaceId)) || []

  if (!cacheData || forceUpdate || !isEmptyArray(needUpdateSpaceIds)) {
    const result = await subsocialGraphQlClient.request(GET_CREATORS_SPACES, {
      ids: spaceIds
    })

    if (!result) return cacheData || []

    const spacesPromise = result.spaces.map(async (space) => {
      const { ownedByAccount, id: spaceId } = space

      const account = ownedByAccount?.id

      const domain = await runQueryOrUndefined(subsocial, (api) =>
        api.query.domains.domainByInnerValue(account, { Space: spaceId })
      )

      creatorsSpacesCache.set(space.id, {
        ...space,
        links: space.linksOriginal?.split(',') || [],
        domain: domain?.toHuman()
      })
    })

    await Promise.all(spacesPromise)
  }

  const values = await creatorsSpacesCache.getAllValues(spaceIds)

  return Object.values(values || {})
}
