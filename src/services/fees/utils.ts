import { ApiProvider, Bridge, ChainId } from '@polkawallet/bridge'
import { AcalaAdapter, KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { AstarAdapter, ShidenAdapter } from '@polkawallet/bridge/adapters/astar'
import { BifrostAdapter } from '@polkawallet/bridge/adapters/bifrost'
import { AltairAdapter } from '@polkawallet/bridge/adapters/centrifuge'
import { ShadowAdapter } from '@polkawallet/bridge/adapters/crust'
import { CrabAdapter } from '@polkawallet/bridge/adapters/darwinia'
import { BasiliskAdapter, HydraAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { IntegriteeAdapter } from '@polkawallet/bridge/adapters/integritee'
import { InterlayAdapter, KintsugiAdapter } from '@polkawallet/bridge/adapters/interlay'
import { KicoAdapter } from '@polkawallet/bridge/adapters/kico'
import { PichiuAdapter } from '@polkawallet/bridge/adapters/kylin'
import { CalamariAdapter } from '@polkawallet/bridge/adapters/manta'
import { MoonbeamAdapter, MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { TuringAdapter } from '@polkawallet/bridge/adapters/oak'
import { HeikoAdapter, ParallelAdapter } from '@polkawallet/bridge/adapters/parallel'
import { KhalaAdapter } from '@polkawallet/bridge/adapters/phala'
import { PolkadotAdapter, KusamaAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { StatemineAdapter } from '@polkawallet/bridge/adapters/statemint'
import { ZeitgeistAdapter } from '@polkawallet/bridge/adapters/zeitgeist'
import { BaseCrossChainAdapter } from '@polkawallet/bridge/base-chain-adapter'
import { firstValueFrom } from 'rxjs'
import { SubsocialAdapter } from './custom/SubsocialAdapter'

const transferAdapters: Record<string, { adapter: BaseCrossChainAdapter; chainName?: ChainId }> = {
  polkadot: {
    adapter: new PolkadotAdapter()
  },
  kusama: {
    adapter: new KusamaAdapter()
  },
  karura: {
    adapter: new KaruraAdapter()
  },
  astar: {
    adapter: new AstarAdapter()
  },
  shiden: {
    adapter: new ShidenAdapter()
  },
  acala: {
    adapter: new AcalaAdapter()
  },
  statemine: {
    adapter: new StatemineAdapter()
  },
  statemint: {
    adapter: new StatemineAdapter()
  },
  altair: {
    adapter: new AltairAdapter()
  },
  shadow: {
    adapter: new ShadowAdapter()
  },
  'darwinia-crab-parachain': {
    adapter: new CrabAdapter(),
    chainName: 'crab'
  },
  basilisk: {
    adapter: new BasiliskAdapter()
  },
  kintsugi: {
    adapter: new KintsugiAdapter()
  },
  interlay: {
    adapter: new InterlayAdapter()
  },
  kico: {
    adapter: new KicoAdapter()
  },
  pichiu: {
    adapter: new PichiuAdapter()
  },
  calamari: {
    adapter: new CalamariAdapter()
  },
  moonbeam: {
    adapter: new MoonbeamAdapter()
  },
  moonriver: {
    adapter: new MoonriverAdapter()
  },
  khala: {
    adapter: new KhalaAdapter()
  },
  bifrostKusama: {
    adapter: new BifrostAdapter(),
    chainName: 'bifrost'
  },
  integritee: {
    adapter: new IntegriteeAdapter()
  },
  turing: {
    adapter: new TuringAdapter()
  },
  parallel: {
    adapter: new ParallelAdapter()
  },
  heiko: {
    adapter: new HeikoAdapter(),
    chainName: 'heiko'
  },
  hydradx: {
    adapter: new HydraAdapter(),
  },
  zeitgeist: {
    adapter: new ZeitgeistAdapter()
  },
  subsocial: {
    adapter: new SubsocialAdapter(),
  }
}
function getPolkawalletChainName(chain: string) {
  const chainData = transferAdapters[chain]
  if (!chainData) return undefined
  return chainData.chainName || (chain as ChainId)
}

const provider = new ApiProvider()

const bridge = new Bridge({
  adapters: Object.values(transferAdapters).map(({ adapter }) => adapter)
})

export async function getCrossChainAdapter(
  chain: string,
  connectNode?: string
): Promise<BaseCrossChainAdapter | undefined> {
  const chainName = getPolkawalletChainName(chain)
  if (!chainName) return undefined

  const adapter = bridge.findAdapter(chainName)
  if (connectNode) {
    await firstValueFrom(provider.connectFromChain([chainName], { [chainName]: [connectNode] }))
    await adapter.init(provider.getApi(chainName))
  }
  return adapter
}
