import { ApiPromise } from '@polkadot/api'
import { ONE_DAY } from '../constant'
import Cache from '../cache'
import { BN_ZERO } from '@polkadot/util'
import { convertToBalanceWithDecimal } from '@subsocial/utils'

const totalSupplyCache = new Cache<string>('totalSupply', ONE_DAY)

export const getTotalSupplyByNetwork = async (api: ApiPromise, network: string) => {
  const cacheData = await totalSupplyCache.get(network)

  if (cacheData) return cacheData

  if (!api) return '0'

  try {
    const totalIssuance = await api.query.balances.totalIssuance()
    const totalSupply = convertToBalanceWithDecimal(
      totalIssuance?.toString(),
      api.registry.chainDecimals[0]
    ).toString()

    await totalSupplyCache.set(network, totalSupply)

    return totalSupply
  } catch (error) {
    return cacheData ?? '0'
  }
}


const circulationSupplyCache = new Cache<string>('circulationSupply', ONE_DAY)
export const getCirculatingSupplyByNetwork = async (api: ApiPromise, network: string) => {
  const cacheData = await circulationSupplyCache.get(network)

  if (cacheData) return cacheData

  if (!api) return '0'

  try {
    const totalIssuance = await api.query.balances.totalIssuance()
    const locks = await api.query.balances.locks.entries()

    // TODO: add support for reserved balances

    const totalLocked = locks.reduce((acc, [_, lock]) => {
      return acc.add(lock.reduce((acc, lock) => acc.add(lock.amount.toBn()), BN_ZERO))
    }, BN_ZERO)

    const circulationSupply = convertToBalanceWithDecimal(
      totalIssuance.sub(totalLocked).toString(),
      api.registry.chainDecimals[0]
    ).toString()

    await circulationSupplyCache.set(network, circulationSupply)

    return
  } catch (error) {
    return cacheData ?? '0'
  }
}

