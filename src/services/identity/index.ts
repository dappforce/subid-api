import { WithApis } from '../types'
import Cache from '../../cache'
import { getSubsococilaIdentity } from './subsocialIdentity'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { tryToGetIdentityFromSquid } from './getIdentityFromSquid'
import { ApiPromise } from '@polkadot/api'
import { getIdentityFromChain } from './getIdentityFromChain'
import { pick } from 'lodash'

const updateDelay = 24 * 3600 * 1000 //seconds
export const identitiesInfoCache = new Cache<any>('identities', updateDelay)

type FetchType = 'blockchain' | 'squid'

export const getIdentity = async (
  api: ApiPromise,
  accounts: string[],
  chain: string,
  type: FetchType
) => {
  const needUpdate = identitiesInfoCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheDataByChain = await identitiesInfoCache.get(chain)

  const cachedDataKeys = cacheDataByChain ? Object.keys(cacheDataByChain) : []

  const needFetch = cacheDataByChain
    ? accounts.filter((account) => !cachedDataKeys.includes(account))
    : accounts

  if (!isEmptyArray(needFetch)) {
    const accountsToFetch = forceUpdate ? accounts : needFetch

    type === 'squid'
      ? await tryToGetIdentityFromSquid(api, accountsToFetch, chain)
      : await getIdentityFromChain(api, accountsToFetch, chain)
  }

  const updatedIdentityInfo = await identitiesInfoCache.get(chain)

  const result = pick(updatedIdentityInfo, accounts)

  return result
}

type GetIdentitiesProps = WithApis & {
  accounts: string[]
}

export const getIdentities = async ({
  apis: { kusama , polkadot },
  accounts
}: GetIdentitiesProps) => {
  const identities = {}

  const filteredAccounts = accounts.filter((account) => isDef(account) && !!account)

  const [kusamaIdentity, polkadotIdentity, subsocialIdentity] = await Promise.all([
    getIdentity(kusama, filteredAccounts, 'kusama', 'squid'),
    getIdentity(polkadot, filteredAccounts, 'polkadot', 'squid'),
    getSubsococilaIdentity(filteredAccounts)
  ])

  filteredAccounts.forEach((account) => {
    identities[account] = {
      kusama: kusamaIdentity?.[account],
      polkadot: polkadotIdentity?.[account],
      subsocial: subsocialIdentity?.[account]
    }
  })

  return identities
}
