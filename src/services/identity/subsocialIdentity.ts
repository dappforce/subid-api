import { subsocialGraphQlClient } from '../../constant/graphQlClients'
import { SubsocialProfilesResult } from '../types'
import { encodeAddress } from '@polkadot/util-crypto'
import { toGenericAccountId } from '../utils'
import { gql } from 'graphql-request'

const GET_SUBSOCIAL_PROFILES = gql`
  query GetProfilesData($ids: [String!]) {
    accounts(where: { id_in: $ids }) {
      profileSpace {
        content
        createdAtBlock
        createdAtTime
        createdByAccount {
          id
        }
        email
        name
        linksOriginal
        hidden
        id
        updatedAtTime
        postsCount
        image
        tagsOriginal
        summary
        about
        ownedByAccount {
          id
        }
        experimental
      }
    }
  }
`

export const getSubsococilaIdentity = async (accounts: string[]) => {
  const subsocialIdentities = {}

  const encodedAccounts = accounts.map((account) => encodeAddress(account, 28))
  const spaces: SubsocialProfilesResult = await subsocialGraphQlClient.request(
    GET_SUBSOCIAL_PROFILES,
    { ids: encodedAccounts }
  )

  spaces.accounts.forEach((space) => {
    const profileSpace = space.profileSpace

    if (profileSpace) {
      subsocialIdentities[toGenericAccountId(profileSpace.ownedByAccount.id)] = profileSpace
    }
  })

  return subsocialIdentities
}
