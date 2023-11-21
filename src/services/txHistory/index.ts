import { GraphQLClient, gql } from 'graphql-request'
import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/util-crypto'
import { getOrCreateQueue } from './queue'

export const txAggregatorClient = new GraphQLClient('http://localhost:8080/graphql')

const buildGetAccountTxHistoryQuery = (networks?: string[], events?: string[]) => {
  const networkFilterValues = networks ? ', blockchainTag: $networks' : ''
  const networkFilterParams = networks ? ', $networks: [BlockchainTag!]' : ''

  const eventFilterValues = events ? ', txKind: $txKind' : ''
  const eventFilterParams = events ? ', $txKind: [TransactionKind!]' : ''

  return gql`
    query getAccountTxHistory($address: String!, $pageSize: Int!, $offset: Int! ${networkFilterParams}${eventFilterParams}) {
      accountTxHistory(
        args: { where: { publicKey: $address ${networkFilterValues}${eventFilterValues} }, pageSize: $pageSize, offset: $offset }
      ) {
        data {
          id
          txKind
          blockchainTag
          amount
          senderOrTargetPublicKey
          timestamp
          success
          transaction {
            transferNative {
              extrinsicHash
            }
          }
        }
      }
    }
  `
}

type GetAccountTransactionsWithQueue = {
  address: string
  pageSize: number
  offset: number
}

type GetAccountTransactions = GetAccountTransactionsWithQueue & {
  networks?: string[]
  events?: string[]
}

export const getAccountTxHistory = async ({
  address,
  pageSize,
  offset,
  networks,
  events
}: GetAccountTransactions) => {
  const networkFilterValues = networks
    ? { networks: networks.map((network) => network.toUpperCase()) }
    : {}
  const eventsFilterValues = events ? { txKind: events.map((event) => event.toUpperCase()) } : {}

  const query = buildGetAccountTxHistoryQuery(networks, events)

  const txs = await txAggregatorClient.request(query, {
    address,
    pageSize,
    offset,
    ...networkFilterValues,
    ...eventsFilterValues
  })

  return txs?.accountTxHistory?.data
}

export const getAccountTxHistoryWithQueue = async (props: GetAccountTransactionsWithQueue) => {
  const txs = await getAccountTxHistory(props)

  const address = props.address

  const taskPayload = {
    publicKey: u8aToHex(decodeAddress(address))
  }

  const queue = getOrCreateQueue()

  const jobByAddress = await queue.getJob(address)

  let actualData = false

  if (jobByAddress) {
    const jobState = await jobByAddress.getState()
    console.log('Job state', jobState)

    if (jobState === 'completed') {
      await jobByAddress.remove()

      actualData = true
    }
  } else {
    console.log('Create new job')
    await queue.add('REFRESH_TX_HISTORY_FOR_ACCOUNT_ON_DEMAND', taskPayload, {
      attempts: 5,
      jobId: address,
      removeOnComplete: false,
      removeOnFail: false
    })
  }

  return { txs, actualData }
}
