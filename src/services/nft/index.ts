import { getRmrkNftsByAccount } from './rmrk'
import { GetDataByAccountProps } from '../types'
import { getNftsByAccountFromKodadot } from './kodadot'

const resOrDefault = <T>(res: PromiseSettledResult<T>) => {
  return res.status === 'fulfilled' ? res.value : []
}

export const getNftsByAccount = async ({ account }: GetDataByAccountProps) => {
  const [rmrkRes, statemineRes] = await Promise.allSettled([
    getRmrkNftsByAccount(account),
    getNftsByAccountFromKodadot(account, 'statemine.svg', 'stmn')
  ])

  return {
    ...resOrDefault(rmrkRes),
    statemine: resOrDefault(statemineRes)
  }
}
