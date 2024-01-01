import { axiosGetRequest } from './utils'
import { FIVE_MINUTES } from '../constant/index'
import Cache from '../cache'

const cacheKey = 'prices'
const coingeckoUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd'

const pricesCache = new Cache<any>('prices', FIVE_MINUTES)

const fetchPrices = async (ids: string) => {
  const cacheData = (await pricesCache.get(cacheKey)) || ({} as any)

  if (cacheData?.loading) return

  await pricesCache.set(cacheKey, {
    ...cacheData,
    loading: true
  })

  const newPrices = await axiosGetRequest(`${coingeckoUrl}&ids=${ids}`, { timeout: 5000 })

  const subsocialTokenPrice = await axiosGetRequest(
    'https://api.hydradx.io/hydradx-ui/v1/stats/price/24',
    { timeout: 5000 }
  )

  const subsocialTokenPriceObj = subsocialTokenPrice
    ? {
        id: 'subsocial',
        symbol: 'sub',
        name: 'Subsocial',
        current_price: subsocialTokenPrice?.[0]?.price_usd
      }
    : {}

  const newData = newPrices
    ? {
        values: [ ...newPrices, subsocialTokenPriceObj ],
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

  console.log('Is Empty cache data: ', !cacheData?.values || !cacheData?.values.length)

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
