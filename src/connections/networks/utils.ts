import { ONFINALITY_API_KEY } from '../../constant'

export const resolveOnfinalityUrl = (chainName: string) => {
  return {
    node: `wss://${chainName}.api.onfinality.io/ws?apikey=${ONFINALITY_API_KEY}`,
    // node: `https://${chainName}.api.onfinality.io/rpc?apikey=${ONFINALITY_API_KEY}`,
    wsNode: `wss://${chainName}.api.onfinality.io/ws?apikey=${ONFINALITY_API_KEY}`
  }
}