import { GraphQLClient, gql } from 'graphql-request'
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto'
import { identitiesInfoCache } from '.'
import { toGenericAccountId } from '../utils'
import { u8aToHex } from '@polkadot/util'
import { getIdentityFromChain } from './getIdentityFromChain'
import { ApiPromise } from '@polkadot/api'
import { newLogger } from '@subsocial/utils'

const log = newLogger('Identity')

const GET_IDENTITY = gql`
  query GetIdentity($ids: [String!]) {
    accounts(limit: 10, where: { id_in: $ids }) {
      sub {
        id
        name
        super {
          id
          display
        }
      }
      identity {
        id
        display
        email
        legal
        riot
        web
        twitter
        pgpFingerprint
        additional {
          name
          value
        }
        judgement
      }
    }
  }
`

const squidEndpointByChain = {
  kusama: { endpoint: 'https://squid.subsquid.io/gs-main-kusama/graphql', format: '2' },
  polkadot: { endpoint: 'https://squid.subsquid.io/gs-main-polkadot/graphql', format: 'hex' }
}

const getIdentityFromSquid = async (accounts: string[], chain: string) => {
  const identityByChain = await identitiesInfoCache.get(chain)

  const parsedIdentities = {}

  const { endpoint, format } = squidEndpointByChain[chain]
  const convertedAddresses = accounts.map((account) =>
    format !== 'hex' ? encodeAddress(account, parseInt(format)) : u8aToHex(decodeAddress(account))
  )

  const graphqlClient = new GraphQLClient(endpoint, { timeout: 4000 })

  const result = await graphqlClient.request(GET_IDENTITY, { ids: convertedAddresses })

  const data = result.accounts as any[]

  data.forEach((item) => {
    const identity = item.identity
    const sub = item.sub

    if (identity) {
      const isVerify = identity.judgement === 'Reasonable'

      const value = {
        isVerify,
        info: {
          ...identity
        }
      }

      parsedIdentities[toGenericAccountId(identity.id)] = value
    }
    if (sub) {
      const value = {
        info: {
          display: `${sub.super.display}/${sub.name}`
        }
      }

      parsedIdentities[toGenericAccountId(sub.id)] = value
    }
  })

  await identitiesInfoCache.set(chain, { ...identityByChain, ...parsedIdentities })
}

export const tryToGetIdentityFromSquid = async (
  api: ApiPromise,
  accounts: string[],
  chain: string
) => {
  try {
    await getIdentityFromSquid(accounts, chain)
  } catch (e) {
    log.warn('Failed to get identity from squid, trying to get from chain', e)
    await getIdentityFromChain(api, accounts, chain)
  }
}
