import { gql } from 'graphql-request'
import Cache from '../../cache'
import { FIVE_MINUTES } from '../../constant'
import { subsocialGraphQlClient } from '../../constant/graphQlClients'

const creatorsSpacesCache = new Cache('creators-spaces', FIVE_MINUTES)

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
      postsCount
      linksOriginal
      ownedByAccount {
        id
      }
    }
  }
`

export const getCreatorsSpacesInfo = async ({ spaceIds }: CreatorsSpacesInfo) => {
  const result = await subsocialGraphQlClient.request(GET_CREATORS_SPACES, { ids: spaceIds })

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
