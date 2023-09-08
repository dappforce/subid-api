import { PalletName } from "@subsocial/api/types"
import axios from "axios"

type RpcParams = any[]

type StorageItem = {
  moduleName: PalletName | 'creatorStaking'
  method: string
}

type RpcResult = {
  result: any
}

const createRpcJson = ({ moduleName, method }: StorageItem, params: RpcParams) => ({
  jsonrpc: '2.0',
  id: 1,
  method: `${moduleName}_${method}`,
  params
})

export async function rpcQuery<Params, Result = any>(
  rpcUrl: string,
  method: StorageItem,
  value?: Params
): Promise<Result | undefined> {
  try {
    const params = Array.isArray(value) ? value : [value]

    const { data, status, statusText } = await axios.post<RpcResult>(
      rpcUrl,
      createRpcJson(method, [...params]),
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (status !== 200) {
      throw statusText
    }

    return data.result
  } catch (err) {
    console.error('Failed rpc method:', err)
    return undefined
  }
}