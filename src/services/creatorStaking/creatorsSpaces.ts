import { gql } from 'graphql-request'
import Cache from '../../cache'
import { ONE_HOUR } from '../../constant'
import { soonsocialGraphQlClient } from '../../constant/graphQlClients'

const creatorsSpacesCache = new Cache('creators-spaces', ONE_HOUR * 24)

type CreatorsSpacesInfo = {
  spaceIds: string[]
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
      linksOriginal
      ownedByAccount {
        id
      }
    }
  }
`

export const getCreatorsSpacesInfo = async ({ spaceIds }: CreatorsSpacesInfo) => {
  const result = await soonsocialGraphQlClient.request(GET_CREATORS_SPACES, { ids: spaceIds })

  if (!result) return []

  const needUpdate = creatorsSpacesCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheData = await creatorsSpacesCache.get()

  if (!cacheData || forceUpdate) {
    const spaces = result.spaces.map((space) => {
      return {
        ...space,
        links: space.linksOriginal?.split(',') || []
      }
    })

    creatorsSpacesCache.set(undefined, spaces)
  }

  return creatorsSpacesCache.get()
}
