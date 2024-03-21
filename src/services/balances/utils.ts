import { ApiPromise } from '../../connections/networks/types'
import BN from 'bn.js'
import { getGenshiroTokens } from './genshiro'
import { getOrUpdatePropertiesByNetwork } from '../properties'
import { asTypesGenerator } from '../../utils'
import { bnMax } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'

const log = newLogger('Balances')

export type TokenBalances = Record<string, any>

const getNativeTokenBalance = async (api: ApiPromise, account: string) => {
  const {
    data: { free, frozen, reserved }
  }: any = await api.query.system.account(account)

  const locks = await api.query.balances.locks(account)

  const lockedBalance = locks.length && bnMax(...locks.map(({ amount }) => amount))

  const totalBalance = reserved ? free.add(reserved) || 0 : free

  const freeBalance = lockedBalance ? free.sub(lockedBalance) : free

  return {
    totalBalance: totalBalance?.toString(),
    reservedBalance: reserved?.toString(),
    frozenBalance: frozen?.toString(),
    freeBalance: freeBalance?.gt(new BN(0)) ? freeBalance?.toString() : '0',
    lockedBalance: lockedBalance?.toString(),
    locks: locks.map(({ id, amount, reasons }) => ({
      id: id.toHuman(),
      amount: amount.toString(),
      reasons
    }))
  }
}

type Balances = {
  freeBalance: string
  reservedBalance: string
  frozen: string
  totalBalance: string
}

export const parseBalances = (
  free?: BN,
  reserved?: BN,
  frozen?: BN,
  locks: any[] = [],
  other?: Record<string, any>
) => {
  const totalBalance = reserved ? free.add(reserved) || 0 : free
  const lockedBalance = locks.length && bnMax(...locks.map(({ amount }) => amount))

  const freeBalance = lockedBalance ? free.sub(lockedBalance) : free

  return {
    freeBalance: freeBalance.toString(),
    reservedBalance: reserved?.toString(),
    lockedBalance: lockedBalance?.toString(),
    frozen: frozen?.toString(),
    totalBalance: totalBalance?.toString(),
    ...other
  }
}

type GetBalancesType = (
  api: ApiPromise,
  network: string,
  account: string,
  tokens?: any[]
) => Promise<TokenBalances>

type TokenBalanceData = {
  free?: BN
  frozen?: BN
  reserved?: BN
}
async function defaultOrmlTokenGetter(
  api: ApiPromise,
  { account, token }: { account: string; token: any }
): Promise<{ balances: TokenBalanceData; locks?: any[] }> {
  const [balances, locks] = await api.queryMulti([
    [api.query.tokens.accounts, [account, token]],
    [api.query.tokens.locks, [account, token]]
  ])

  return {
    balances: balances as any,
    locks: locks as any
  }
}

const customOrmlTokenGetter = asTypesGenerator<
  (
    ...params: Parameters<typeof defaultOrmlTokenGetter>
  ) => ReturnType<typeof defaultOrmlTokenGetter>
>()({
  'assets.account': async (api, { account, token }) => {
    const balancesCodec = await api.query.assets.account(token, account)
    const data = balancesCodec.toPrimitive()
    const { isFrozen, balance } = data || ({} as any)
    const balanceData: TokenBalanceData = {
      free: new BN(0),
      frozen: new BN(0)
    }
    balanceData[isFrozen ? 'frozen' : 'free'] = new BN(balance)
    return { balances: balanceData }
  },
  'ormlTokens.accounts': async (api, { account, token }) => {
    const [balances, locks] = await api.queryMulti([
      [api.query.ormlTokens.accounts, [account, token]],
      [api.query.ormlTokens.locks, [account, token]]
    ])
    return { balances: balances as any, locks: locks as any }
  },
  'tokens.accounts': async (api, { account, token }) => {
    const [balances, locks] = await api.queryMulti([
      [api.query.tokens.accounts, [account, { XCM: token }]],
      [api.query.tokens.locks, [account, { XCM: token }]]
    ])
    return { balances: balances as any, locks: locks as any }
  }
})
const ormlTokenGetterNetworkMapper: { [key: string]: keyof typeof customOrmlTokenGetter } = {
  astar: 'assets.account',
  shiden: 'assets.account',
  statemine: 'assets.account',
  statemint: 'assets.account',
  pichiu: 'assets.account',
  calamari: 'assets.account',
  manta: 'assets.account',
  moonbeam: 'assets.account',
  moonriver: 'assets.account',
  parallel: 'assets.account',
  parallelHeiko: 'assets.account',
  phala: 'assets.account',
  khala: 'assets.account',
  altair: 'ormlTokens.accounts',
  centrifuge: 'ormlTokens.accounts',
  shadow: 'ormlTokens.accounts',
  pendulum: 'tokens.accounts',
}

const getOrmlTokens: GetBalancesType = async (api, network, account, tokens) => {
  const tokenBalances: TokenBalances = {}

  const balanceGetter =
    customOrmlTokenGetter[ormlTokenGetterNetworkMapper[network] ?? ''] ?? defaultOrmlTokenGetter

  const balancePromise = tokens.map(async (token) => {
    try {
      let balances = {} as unknown as Balances
      const isObject = typeof token === 'object'

      const balancesCodec = await balanceGetter(api, {
        account: account,
        token: isObject ? token.currency : { Token: token }
      })
      const { free, frozen, reserved } = balancesCodec.balances as any
      balances = parseBalances(free, reserved, frozen, balancesCodec.locks)

      tokenBalances[isObject ? token.symbol : token] = {
        ...balances
      }
    } catch (e) {
      // ok
      log.warn(`Failed to get balance for ${token}`, e)
    }
  })

  await Promise.all(balancePromise)

  return tokenBalances
}

const getOnlyOrmlTokens = async (api: ApiPromise, account: string, network: string) => {
  const props = await getOrUpdatePropertiesByNetwork(api, network)
  const tokenSymbols = (props?.tokenSymbols as string[]) || []
  const tokens = (props?.assetsRegistry as Record<string, any>) || {}

  return getOrmlTokens(api, network, account, [...tokenSymbols, ...Object.values(tokens)])
}

const getNativeAndOrmlTokens = async (api: ApiPromise, account: string, network: string) => {
  const tokenBalances: TokenBalances = {}

  const props = await getOrUpdatePropertiesByNetwork(api, network)
  const tokenSymbols = (props?.tokenSymbols as string[]) || []
  const tokens = (props?.assetsRegistry as Record<string, any>) || {}
  const [native] = tokenSymbols

  tokenBalances[native] = await getNativeTokenBalance(api, account)
  const ormlBalances = await getOrmlTokens(api, network, account, Object.values(tokens))

  return {
    ...ormlBalances,
    ...tokenBalances
  }
}

type GetOrmlBalancesType = (
  api: ApiPromise,
  account: string,
  network: string,
  tokens?: any[]
) => Promise<TokenBalances>

const customFetchBalancesByNetwork: Record<string, GetOrmlBalancesType> = {
  kintsugi: getOnlyOrmlTokens,
  interlay: getOnlyOrmlTokens,
  genshiro: getGenshiroTokens
}

export const getTokensFnByNetwork = (network) => {
  return customFetchBalancesByNetwork[network] || getNativeAndOrmlTokens
}
