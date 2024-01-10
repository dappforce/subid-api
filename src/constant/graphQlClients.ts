import { GraphQLClient } from 'graphql-request'
import { SUBSOCIAL_GRAPHQL_CLIENT, QUARTZ_GRAPHQL_CLIENT } from './index'
import { RelayChain } from '../services/crowdloan/types'

export const subsocialGraphQlClient = new GraphQLClient(SUBSOCIAL_GRAPHQL_CLIENT)

export const soonsocialGraphQlClient = new GraphQLClient(
  'https://squid.subsquid.io/soonsocial/graphql'
)

export const txAggregatorGraphQlClient = new GraphQLClient(
  'https://datasource-subquery-aggregation.subsocial.network/graphql'
)

export const contributionsClientByRelay: Record<
  RelayChain,
  { client: GraphQLClient; addressPrefix: number }
> = {
  kusama: {
    client: new GraphQLClient('https://squid.subsquid.io/kusama-explorer/graphql', {
      timeout: 4000
    }),
    addressPrefix: 2
  },
  polkadot: {
    client: new GraphQLClient('https://squid.subsquid.io/polkadot-explorer/graphql', {
      timeout: 4000
    }),
    addressPrefix: 0
  }
}

export const quartzClient = new GraphQLClient(QUARTZ_GRAPHQL_CLIENT)
