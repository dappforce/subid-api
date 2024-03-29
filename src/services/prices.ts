import { axiosGetRequest } from './utils'
import { FIVE_MINUTES } from '../constant/index'
import Cache from '../cache'

const cacheKey = 'prices'
const coingeckoUrl =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&price_change_percentage=24h'

const pricesCache = new Cache<any>('prices', FIVE_MINUTES)

const fetchPrices = async (ids: string) => {
  const cacheData = (await pricesCache.get(cacheKey)) || ({} as any)

  if (cacheData?.loading) return

  await pricesCache.set(cacheKey, {
    ...cacheData,
    loading: true
  })

  const newPrices = ids
    ? await axiosGetRequest(`${coingeckoUrl}&ids=${ids}`, { timeout: 5000 })
    : undefined

  const newData = newPrices
    ? {
        values: newPrices,
        isCachedData: false,
        lastUpdate: new Date().getTime()
      }
    : { ...cacheData, isCachedData: true }

  await pricesCache.set(cacheKey, {
    ...newData,
    loading: false
  })
}

export const getPrices = async (ids: string) => {
  const needUpdate = pricesCache.needUpdate

  const forceUpdate = needUpdate && (await needUpdate())
  const cacheData = await pricesCache.get(cacheKey)

  if (!cacheData?.values || !cacheData?.values.length) {
    await fetchPrices(ids)
  }

  if (forceUpdate) {
    fetchPrices(ids)
  }

  const cachedData = await pricesCache.get(cacheKey)

  const { values, isCachedData, lastUpdate } = cachedData || {}

  return { prices: values || [], isCachedData: isCachedData, lastUpdate: lastUpdate }
}
