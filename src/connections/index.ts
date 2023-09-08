import networks, { subsocial as connection } from './networks'
import { Apis, GetApiFn } from './networks/types'
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
import { newLogger } from '@subsocial/utils'
import rpc from '@polkadot/types/interfaces/jsonrpc'
import { SubsocialApi } from '@subsocial/api'
import { wsReconnectTimeout } from '../constant'
import { updatePropertiesByNetwork } from '../services/properties'
import { getValidatorsData } from '../services/validatorStaking/validatorsInfo'
import { validatorsStakingNetworks } from '../constant/index'
import { SEC } from '../constant/env'

const log = newLogger('Connections')

const { node, ipfs, offchain } = connection

const subsocialApiProps = {
  substrateNodeUrl: node,
  ipfsNodeUrl: ipfs,
  offchainUrl: offchain
}

let subsocial: SubsocialApi

export const resolveSubsocialApi = (substrateApi?: ApiPromise) => {
  if (!subsocial) {
    if (!substrateApi) return undefined

    subsocial = new SubsocialApi({ substrateApi, ...subsocialApiProps })
  }

  return subsocial
}

type Props = {
  node: string
  network: string
  isMixedConnection?: boolean
  types: any
  mixedApis: Apis
  wsApis: Apis
  wsNode: string
  getApi: GetApiFn
}

const defaultGetApi: GetApiFn = ({ provider, types }) =>
  new ApiPromise({
    provider,
    types,
    rpc,
    throwOnConnect: false,
    throwOnUnknown: false
  })

const connect = async ({
   node,
   getApi,
   types,
   network,
   mixedApis,
  isMixedConnection,
  wsNode,
  wsApis
 }: Props) => {
  if (!node) return

  const nodeName = `${network} node at ${node}`

  log.info(`Connecting to ${nodeName}...`)

  const isHttps = node.includes('https')

  const provider = isHttps
    ? new HttpProvider(node, {})
    : new WsProvider(node, wsReconnectTimeout, {}, 100 * SEC)

  const api = getApi({ provider, types })

  api.on('ready', async () => {
    log.info(`Connected to ${nodeName}`)
    mixedApis[network] = api

    await updatePropertiesByNetwork(api, network)
  })

  if (isHttps && isMixedConnection) {
    const wsProvider = new WsProvider(wsNode, wsReconnectTimeout, {}, 100 * SEC)

    const wsApi = getApi({ provider: wsProvider, types })

    wsApi.on('ready', async () => {
      log.info(`Connected to ${nodeName}`)
      wsApis[network] = wsApi

      if (validatorsStakingNetworks.includes(network)) {
        await getValidatorsData(wsApi, network)
      }
    })
  }
}

export type Connections = {
  mixedApis: Apis
  wsApis: Apis
}

export const createConnections = async () => {
  let connections: Connections = {} as Connections
  const mixedApis: Apis = {} as Apis
  const wsApis: Apis = {} as Apis

  for (const value of Object.entries(networks)) {
    const [
      network,
      { node, types, getApi = defaultGetApi, isMixedConnection, wsNode, disabled }
    ] = value

    if (node) {
      !disabled &&
      connect({
        network,
        node,
        types,
        wsNode,
        mixedApis,
        wsApis,
        isMixedConnection,
        getApi
      }).catch(log.error)
    }
  }

  connections = {
    mixedApis,
    wsApis
  }

  subsocial = resolveSubsocialApi(connections.mixedApis.subsocial)

  return connections
}
