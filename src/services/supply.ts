import { ApiPromise } from '@polkadot/api'
import { ONE_DAY } from '../constant'
import Cache from '../cache'
import { BN_ZERO } from '@polkadot/util'

const totalSupplyCache = new Cache<string>('totalSupply', ONE_DAY)

export const getTotalSupplyByNetwork = async (api: ApiPromise, network: string) => {
  const cacheData = await totalSupplyCache.get(network)

  if (cacheData) {
    return cacheData
  }

  if (api) {
    try {
      const totalIssuance = await api.query.balances.totalIssuance()
      const totalIssuanceStr = totalIssuance?.toString()
      await totalSupplyCache.set(totalIssuanceStr)

      return totalIssuanceStr

    } catch (error) {
      return cacheData
    }
  }

  return '0'
}


const circulationSupplyCache = new Cache<string>('circulationSupply', ONE_DAY)
export const getCirculationSupplyByNetwork = async (api: ApiPromise, network: string) => {
  const cacheData = await circulationSupplyCache.get(network)

  if (cacheData) {
    return cacheData
  }

  if (api) {
    try {
      const totalIssuance = await api.query.balances.totalIssuance()
      const locks = await api.query.balances.locks.entries()
      // TODO: add reserves when we have a way to get them
      // const reserves = await api.query.balances.reserves.entries()

      const totalLocked = locks.reduce((acc, [_, locks]) => {
        return acc.add(locks.reduce((acc, lock) => acc.add(lock.amount.toBn()), BN_ZERO))
      }, BN_ZERO)

      const circulationSupply = totalIssuance.sub(totalLocked).toString()

      await circulationSupplyCache.set(circulationSupply)

      return circulationSupply

    } catch (error) {
      return cacheData
    }
  }

  return '0'
}

