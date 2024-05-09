import { ApiPromise } from '@polkadot/api'
import { newLogger } from '@subsocial/utils'
import { parseStringValue } from '../utils'

const log = newLogger('AssetRegistry')

export const commonAssetRegistries = {
  'assets.metadata': generateCommonAssetRegistry(['assets', 'metadata']),
  'assetRegistry.metadataMap': generateCommonAssetRegistry(['assetRegistry', 'assetMetadataMap']),
  'assetRegistry.assets': generateCommonAssetRegistry(['assetRegistry', 'assets']),
  'ormlAssetRegistry.metadata': generateCommonAssetRegistry(['ormlAssetRegistry', 'metadata']),
  'currencies.listenAssetsInfo': generateCommonAssetRegistry(
    ['currencies', 'listenAssetsInfo'],
    (data) => data.metadata
  ),
  'assetRegistry.metadata': generateCommonAssetRegistry(['assetRegistry', 'metadata'])
}

function defaultCurrencyDataGetter(data: any) {
  return { decimals: data.decimals as number, symbol: data.symbol as string }
}
export default function generateCommonAssetRegistry(
  getterMethod: [string, string],
  currencyDataGetter = defaultCurrencyDataGetter
) {
  return async (api: ApiPromise): Promise<Record<string, any>> => {
    try {
      const [palletName, storageName] = getterMethod
      const assetsRegistryFromStorage = await api.query[palletName][storageName].entries()
      const assetRegistry = {}

      assetsRegistryFromStorage.forEach((assetsRegistry) => {
        const [currency, currencyData] = assetsRegistry
        const { decimals, symbol } = currencyDataGetter(currencyData.toPrimitive())

        let currencyHuman = currency.toHuman()[0]
        if (typeof currencyHuman === 'string') {
          currencyHuman = parseStringValue(currencyHuman)
        }

        if (typeof currencyHuman === 'object') {
          const currencyEntries = Object.entries(currencyHuman)

          const [key, value] = currencyEntries[0]

          const parsedValue = Array.isArray(value)
            ? value.map((item) => parseStringValue(item.toString()))
            : parseStringValue(value.toString())

          currencyHuman = {
            [key]: parsedValue
          }
        }
        assetRegistry[symbol] = {
          currency: currencyHuman,
          decimals,
          symbol
        }
      })

      return assetRegistry
    } catch (e) {
      log.warn(`Failed to get assets registry from storage`, e)
      return {}
    }
  }
}
