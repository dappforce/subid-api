import { hexToString } from '@polkadot/util'
import { Option } from '@polkadot/types'
import { identitiesInfoCache } from '.'
import { Registration } from '@polkadot/types/interfaces'
import { toGenericAccountId } from '../utils'
import { isEmptyObj } from '@subsocial/utils'
import { ApiPromise } from '@polkadot/api'

type Field = {
  raw: string
}

const identityFieldsToString = (fields: Record<string, Field>) => {
  if (!fields) return undefined

  const newFields = {}

  for (const key in fields) {
    const { raw } = fields[key]
    newFields[key] = hexToString(raw?.toString())
  }

  return newFields
}

const parseIdentity = async (
  chain: string,
  accounts: string[],
  accountsWithSubIdentity: string[],
  superOfMultiObj: Record<string, any>,
  identities?: Option<any>[]
) => {
  if (!identities) return undefined
  const identityByChain = await identitiesInfoCache.get(chain)

  const parsedIdentities = {}
  const identityByAccount = {}

  identities?.forEach((identityOpt, i) => {
    const identity = identityOpt.unwrapOr(undefined) as Registration | undefined

    if (!identity) return undefined

    const account = accountsWithSubIdentity[i]

    const {
      info: { additional, pgpFingerprint, ...fields },
      judgements
    } = identity.toJSON() as any

    const isVerify = !!judgements.filter((x) => x[1].isReasonable).length

    const value = {
      isVerify,
      info: {
        additional,
        pgpFingerprint,
        ...identityFieldsToString(fields)
      }
    }

    parsedIdentities[account] = value
  })

  accounts.forEach((account) => {
    const genericAccountId = toGenericAccountId(account)

    const identity = parsedIdentities[toGenericAccountId(genericAccountId)] || {}

    if (!isEmptyObj(identity)) {
      identityByAccount[genericAccountId] = identity
      return
    }

    const superOf = superOfMultiObj[genericAccountId] || {}

    const parent = superOf?.parent

    const genericAccount = parent ? toGenericAccountId(parent) : ''

    const parentIdentity = parsedIdentities[genericAccount] || {}

    if (isEmptyObj(parentIdentity)) return

    identityByAccount[genericAccountId] = {
      info: {
        display: `${parentIdentity.info.display}/${superOf.raw}`
      }
    }
  })

  await identitiesInfoCache.set(chain, { ...identityByChain, ...identityByAccount })
}

export const getIdentityFromChain = async (api: ApiPromise, accountsToFetch: string[], chain: string) => {
  const superOfMulti = (await api.query.identity.superOf.multi(accountsToFetch)) as Option<any>[]

  const superOfMultiObj = {}
  const parentIds = []

  accountsToFetch.forEach((account, i) => {
    const superOf = superOfMulti[i].unwrapOr(undefined)

    if (!superOf) return

    const [key, value] = superOf

    const parentId = key.toHuman()

    parentIds.push(toGenericAccountId(parentId))

    superOfMultiObj[account] = {
      parent: parentId,
      raw: hexToString(value.toJSON()['raw'])
    }
  })

  const accountsWithSubIdentity = [...accountsToFetch, ...parentIds]

  const identities = (await api.query.identity.identityOf.multi(
    accountsWithSubIdentity
  )) as Option<any>[]

  await parseIdentity(chain, accountsToFetch, accountsWithSubIdentity, superOfMultiObj, identities)
}