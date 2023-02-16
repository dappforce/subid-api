import { Networks } from './types'
import { getBitfrostApi, resolveOnfinalityUrl } from './utils';
import { RelayChain } from '../../services/crowdloan/types'

export const subsocial = {
  name: 'Subsocial',
  node: 'wss://para.subsocial.network',
  icon: 'subsocial-parachain.svg',
  paraId: 2100,
  ipfs: 'https://ipfs.subsocial.network',
  offchain: 'https://api.subsocial.network'
}

export const standalones: Networks = {
  kusama: {
    name: 'Kusama',
    node: resolveOnfinalityUrl('kusama'),
    icon: 'kusama.svg',
    isTransferable: true
  },
  polkadot: {
    name: 'Polkadot',
    node: resolveOnfinalityUrl('polkadot'),
    icon: 'polkadot.svg',
    isTransferable: true
  },
  sora: {
    name: 'SORA',
    icon: 'sora-substrate.svg',
    node: 'wss://mof2.sora.org',
    nativeToken: 'XOR',
    isTransferable: true
  },
  edgeware: {
    name: 'Edgeware',
    icon: 'edgeware-circle.svg',
    node: 'wss://edgeware.jelliedowl.net'
  },
  chainx: {
    name: 'ChainX',
    icon: 'chainx.svg',
    node: 'wss://mainnet.chainx.org',
    isTransferable: true
  },
  darwinia: {
    name: 'Darwinia',
    icon: 'darwinia.png',
    node: 'wss://rpc.darwinia.network',
    isTransferable: true
  },
  'darwinia-crab': {
    name: 'Darwinia Crab',
    icon: 'crab.svg',
    node: 'wss://crab-rpc.darwinia.network',
    isTransferable: true
  },
  polkadex: {
    name: 'Polkadex',
    icon: 'polkadex.svg',
    node: 'wss://mainnet.polkadex.trade'
  },
  crust: {
    name: 'Crust',
    icon: 'crust.svg',
    node: 'wss://crust.api.onfinality.io/public-ws',
  }
}

export const kusamaParachains: Networks = {
  subsocial: {
    ...subsocial,
    vestingMethod: 'vesting.vest'
  },
  calamari: {
    name: 'Calamari',
    node: 'wss://ws.calamari.systems/',
    icon: 'calamari.png',
    paraId: 2084,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  altair: {
    name: 'Altair',
    node: 'wss://fullnode.altair.centrifuge.io',
    icon: 'altair.svg',
    paraId: 2088,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  basilisk: {
    name: 'Basilisk',
    node: 'wss://rpc.basilisk.cloud',
    icon: 'basilisk.jpg',
    paraId: 2090,
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  parallelHeiko: {
    name: 'Parallel Heiko',
    node: 'wss://heiko-rpc.parallel.fi',
    icon: 'parallel.svg',
    nativeToken: 'HKO',
    paraId: 2085,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  kilt: {
    name: 'Kilt Spiritnet',
    node: 'wss://spiritnet.kilt.io',
    icon: 'kilt.png',
    paraId: 2086,
    isTransferable: true
  },
  polkasmith: {
    name: 'PolkaSmith',
    node: '',
    icon: 'polkasmith.svg',
    paraId: 2009,
    disabled: true
  },
  bifrost: {
    name: 'Bifrost',
    node: resolveOnfinalityUrl('bifrost-parachain'),
    icon: 'bifrost.svg',
    paraId: 2001,
    getApi: getBitfrostApi,
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  statemine: {
    name: 'Statemine',
    node: 'wss://statemine-rpc.polkadot.io',
    icon: 'statemine.svg',
    paraId: 1000,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  genshiro: {
    name: 'Genshiro',
    icon: 'genshiro.svg',
    node: 'wss://node.genshiro.io',
    paraId: 2024,
    nativeToken: 'GENS'
  },
  integritee: {
    name: 'Integritee Network',
    icon: 'integritee.svg',
    node: 'wss://kusama.api.integritee.network',
    paraId: 2015,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  karura: {
    name: 'Karura',
    node: 'wss://karura-rpc-0.aca-api.network',
    icon: 'karura.svg',
    paraId: 2000,
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  khala: {
    name: 'Khala',
    icon: 'khala.svg',
    node: 'wss://khala-api.phala.network/ws',
    paraId: 2004,
    types: {
      BridgeChainId: 'u8'
    },
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  kintsugi: {
    name: 'Kintsugi BTC',
    icon: 'kintsugi.png',
    node: 'wss://kintsugi.api.onfinality.io/public-ws',
    paraId: 2092,
    nativeToken: 'KINT',
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  mars: {
    name: 'Mars',
    icon: 'mars.png',
    node: '',
    paraId: 2008,
    disabled: true
  },
  moonriver: {
    name: 'Moonriver',
    node: resolveOnfinalityUrl('moonriver'),
    icon: 'moonriver.svg',
    paraId: 2023,
    isEthLike: true,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  sakura: {
    name: 'Sakura',
    icon: 'sakura.svg',
    node: '',
    paraId: 2016,
    disabled: true
  },
  sherpax: {
    name: 'SherpaX',
    icon: 'sherpax.svg',
    node: '',
    paraId: 2013,
    disabled: true
  },
  shiden: {
    name: 'Shiden',
    node: 'wss://rpc.shiden.astar.network',
    icon: 'shiden.png',
    paraId: 2007,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  picasso: {
    name: 'Picasso',
    node: 'wss://rpc.composablenodes.tech',
    icon: 'picasso.png',
    paraId: 2087,
    nativeToken: 'PICA',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  shadow: {
    name: 'Crust Shadow',
    node: 'wss://rpc-shadow.crust.network',
    icon: 'shadow.svg',
    nativeToken: 'CSM',
    paraId: 2012,
    disabled: true
  },
  bitCountry: {
    name: 'Bit.Country Pioneer',
    node: 'wss://pioneer.api.onfinality.io/public-ws',
    icon: 'bitcountry.svg',
    paraId: 2096,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  robonomics: {
    name: 'Robonomics',
    node: 'wss://kusama.rpc.robonomics.network',
    icon: 'robonomics.svg',
    paraId: 2048,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  quartz: {
    name: 'QUARTZ by UNIQUE',
    node: 'wss://quartz.unique.network',
    icon: 'quartz.png',
    paraId: 2095,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  zeitgeist: {
    name: 'Zeitgeist',
    node: 'wss://zeitgeist.api.onfinality.io/public-ws',
    icon: 'zeitgeist.png',
    paraId: 2101,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  mangata: {
    name: 'Mangata X',
    icon: 'mangata.png',
    node: 'wss://mangata-x.api.onfinality.io/public-ws',
    disabled: true,
    nativeToken: 'MGX',
    paraId: 2110,
    isTransferable: true
  },
  litmus: {
    name: 'Litmus',
    icon: 'litmus.png',
    node: 'wss://rpc.litmus-parachain.litentry.io',
    paraId: 2106,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  kico: {
    name: 'KICO',
    icon: 'kico.png',
    node: 'wss://rpc.kico.dico.io',
    disabled: true,
    nativeToken: 'KICO',
    paraId: 2107,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  'darwinia-crab-parachain': {
    name: 'Darwinia Crab Parachain',
    icon: 'crab.svg',
    node: 'wss://crab-parachain-rpc.darwinia.network',
    disabled: true,
    nativeToken: 'CRAB',
    paraId: 2105,
    isTransferable: true
  },
  'sora-parachain': {
    name: 'SORA Kusama Parachain',
    icon: 'sora-substrate.svg',
    node: 'wss://ws.parachain-collator-1.c1.sora2.soramitsu.co.jp',
    disabled: true,
    paraId: 2011
  },
  'pichiu': {
    name: 'Pichiu',
    icon: 'pichiu.png',
    node: 'wss://pichiu.api.onfinality.io/public-ws',
    disabled: true,
    nativeToken: 'PCHU',
    paraId: 2102,
    vestingMethod: 'vesting.vest',
    isTransferable: true
  },
  turing: {
    name: 'Turing Network',
    node: 'wss://rpc.turing.oak.tech',
    paraId: 2114,
    icon: 'turing.png',
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  dora: {
    name: 'Dora Factory',
    node: 'wss://kusama.dorafactory.org',
    disabled: true,
    nativeToken: 'DORA',
    paraId: 2115,
    icon: 'dora.png'
  },
  tanganika: {
    name: 'Tanganika',
    node: 'wss://tanganika.datahighway.com',
    paraId: 2116,
    nativeToken: 'DHX',
    icon: 'tanganika.png',
    disabled: true
  },
  listen: {
    name: 'Listen Network',
    node: 'wss://rpc.mainnet.listen.io',
    nativeToken: 'LT',
    paraId: 2118,
    icon: 'listen.png',
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  invArch: {
    name: 'InvArch Tinkernet',
    node: 'wss://invarch-tinkernet.api.onfinality.io/public-ws',
    nativeToken: 'TNKR',
    paraId: 2125,
    icon: 'invArch.png',
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  kabocha: {
    name: 'Kabocha',
    node: 'wss://kabocha.jelliedowl.net',
    disabled: true,
    nativeToken: 'KAB',
    paraId: 2113,
    icon: 'kabocha.svg'
  },
  bajun: {
    name: 'Bajun Network',
    node: 'wss://bajun.api.onfinality.io/public-ws',
    disabled: true,
    nativeToken: 'BAJU',
    paraId: 2119,
    icon: 'bajun.png',
    vestingMethod: 'vesting.claim'
  },
  imbue: {
    name: 'Imbue Network',
    node: 'wss://imbue-kusama.imbue.network',
    disabled: true,
    nativeToken: 'IMBU',
    paraId: 2121,
    icon: 'imbue.jpg',
    vestingMethod: 'vesting.vest'
  },
  gm: {
    name: 'GM',
    node: 'wss://ws.gm.bldnodes.org',
    disabled: true,
    nativeToken: 'FREN',
    paraId: 2123,
    icon: 'gm.jpg',
    vestingMethod: 'carrotOnAStick.claim',
    isTransferable: true
  },
  amplitude: {
    name: 'Amplitude',
    node: 'wss://rpc-amplitude.pendulumchain.tech',
    disabled: true,
    nativeToken: 'AMPE',
    paraId: 2124,
    icon: 'amplitude.jpg',
    vestingMethod: 'vesting.vest'
  }
}

export const polkadotParachains: Networks = {
  moonbeam: {
    name: 'Moonbeam',
    node: resolveOnfinalityUrl('moonbeam'),
    icon: 'moonbeam.png',
    paraId: 2004,
    isEthLike: true,
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  clover: {
    name: 'Clover Finance',
    node: 'wss://rpc-para.clover.finance',
    disabled: true,
    nativeToken: 'CLV',
    icon: 'clover.svg',
    paraId: 2002,
    vestingMethod: 'vesting.vest'
  },
  astar: {
    name: 'Astar',
    node: 'wss://rpc.astar.network',
    icon: 'astar.png',
    paraId: 2006,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  litentry: {
    name: 'Litentry',
    node: 'wss://rpc.litentry-parachain.litentry.io',
    disabled: true,
    nativeToken: 'LIT',
    icon: 'litentry.png',
    paraId: 2013,
    vestingMethod: 'vesting.vest'
  },
  manta: {
    name: 'Manta',
    node: '',
    icon: 'manta.png',
    paraId: 2015
  },
  subdao: {
    name: 'SubDAO',
    node: '',
    icon: 'subdao.png',
    paraId: 2018
  },
  'parallel': {
    name: 'Parallel',
    node: 'wss://rpc.parallel.fi',
    icon: 'parallel.svg',
    paraId: 2012,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  acala: {
    name: 'Acala',
    node: 'wss://acala-rpc-1.aca-api.network',
    icon: 'acala.svg',
    paraId: 2000,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'currencies.transfer(recipient,id,amount)'
  },
  'darwinia-pokadot': {
    name: 'Darwinia',
    node: '',
    icon: 'darwinia.png',
    paraId: 2003
  },
  subGame: {
    name: 'SubGame Gamma',
    node: '',
    icon: 'subgame.svg',
    paraId: 2017
  },
  efinity: {
    name: 'Efinity',
    node: 'wss://rpc.efinity.io',
    nativeToken: 'EFI',
    disabled: true,
    icon: 'efinity.svg',
    paraId: 2021,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  composable: {
    name: 'Composable Finance',
    node: 'wss://rpc.composable.finance',
    disabled: true,
    nativeToken: 'LAYR',
    icon: 'composableFinance.png',
    paraId: 2019
  },
  interlay: {
    name: 'Interlay',
    node: 'wss://api.interlay.io/parachain',
    icon: 'interlay.svg',
    paraId: 2032,
    nativeToken: 'INTR',
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  centrifuge: {
    name: 'Centrifuge',
    icon: 'centrifuge.png',
    node: 'wss://fullnode.parachain.centrifuge.io',
    paraId: 2031,
    vestingMethod: 'vesting.vest',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  phala: {
    name: 'Phala Network',
    icon: 'phala.svg',
    node: 'wss://api.phala.network/ws',
    nativeToken: 'PHA',
    paraId: 2035,
    vestingMethod: 'vesting.vest',
    tokenTransferMethod: 'assets.transfer(id,recipient,amount)'
  },
  equilibrium: {
    name: 'Equilibrium',
    icon: 'equilibrium.svg',
    node: 'wss://node.pol.equilibrium.io',
    disabled: true,
    nativeToken: 'EQ',
    paraId: 2011,
    vestingMethod: 'vesting.vest'
  },
  'hydra-dx': {
    name: 'HydraDX',
    icon: 'snakenet.svg',
    node: 'wss://hydradx-rpc.dwellir.com',
    paraId: 2034,
    vestingMethod: 'vesting.claim',
    isTransferable: true,
    tokenTransferMethod: 'tokens.transfer(recipient,id,amount)'
  },
  'nodle': {
    name: 'Nodle',
    node: 'wss://nodle-parachain.api.onfinality.io/public-ws',
    icon: 'nodle.svg',
    paraId: 2026,
    vestingMethod: 'vesting.claim',
    isTransferable: true
  },
  'coinversation': {
    name: 'Coinversation',
    node: '',
    icon: 'coinversation.png',
    paraId: 2027
  },
  'polkadex-polkadot': {
    name: 'Polkadex',
    icon: 'polkadex.svg',
    node: 'wss://polkadex.api.onfinality.io',
    disabled: true,
    nativeToken: 'PDEX',
    paraId: 2040,
    isTransferable: true
  },
  unique: {
    name: 'Unique Network',
    icon: 'unique.svg',
    node: 'wss://us-ws.unique.network',
    disabled: true,
    nativeToken: 'UNQ',
    paraId: 2037,
    vestingMethod: 'vesting.claim'
  },
  geminis: {
    name: 'Geminis',
    icon: 'geminis.png',
    node: '',
    paraId: 2038
  },
  originTrail: {
    name: 'OriginTrail',
    icon: 'origintrail.jpeg',
    node: 'wss://parachain-rpc.origin-trail.network',
    paraId: 2043,
    vestingMethod: 'vesting.vest'
  },
  kylin: {
    name: 'Kylin',
    icon: 'kylin.png',
    node: 'wss://polkadot.kylin-node.co.uk',
    disabled: true,
    nativeToken: 'KYL',
    paraId: 2052,
    vestingMethod: 'vesting.vest'
  }
}

const addRelayChainToNetworks = (networks: Networks, relayChainName: RelayChain) => {
  for (const key in networks) {
    networks[key].relayChain = relayChainName
  }

  return networks
}

const networks = {
  ...standalones,
  ...addRelayChainToNetworks(kusamaParachains, 'kusama'),
  ...addRelayChainToNetworks(polkadotParachains, 'polkadot')
}

export default networks