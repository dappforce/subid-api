import { getClient } from '@kodadot1/uniquery'
import { GraphQLClient, gql } from 'graphql-request'
import { createIpfsUrl } from './utils'
import { isEmptyArray } from '@subsocial/utils'
import { BN } from 'bn.js'

type NftEntity = {
  id: string
  issuer: string
  media: string
  metadata: string
  name: string
  price: string
  currentOwner: string
  recipient: string
  meta: {
    animationUrl: string
    description: string
    id: string
    image: string
    name: string
    type: string
  }
}

type KodadotNetwork = 'stmn'

const buildKodadotLink = (id: string, network: string) =>
  `https://kodadot.xyz/${network}/gallery/${id}`

const getNftsEntities = gql`
  query getNftsEntities($ids: [String!]) {
    nftEntities(where: { id_in: $ids, burned_eq: false }) {
      id
      issuer
      media
      metadata
      name
      price
      recipient
      currentOwner
      meta {
        animationUrl
        description
        id
        image
        name
        type
      }
      image
    }
  }
`

const kodadotGraphqlEndpointsByNetwork = {
  stmn: 'https://squid.subsquid.io/stick/v/v3/graphql'
}

export const getNftsByAccountFromKodadot = async (
  accountId: string,
  stubImage: string,
  network: KodadotNetwork
) => {
  const client = getClient(network)

  const graphqlClient = new GraphQLClient(kodadotGraphqlEndpointsByNetwork[network])

  const nftsQuery = client.itemListByOwner(accountId)

  const nftsResult: any = await client.fetch(nftsQuery)
  const nfts = nftsResult.data.items

  const nftIds = nfts.map(({ id }) => id)

  if (!isEmptyArray(nftIds)) {
    const variables = { ids: nftIds }

    const result = await graphqlClient.request(getNftsEntities, variables)
    const nftsData = result.nftEntities as NftEntity[]

    const promise = nftsData.map((nft) => {
      const { id, name, price, meta } = nft
      const { animationUrl: _animationUrl, image: _image } = meta

      const animationUrl = createIpfsUrl(_animationUrl) || undefined
      const image = createIpfsUrl(_image)

      return {
        id,
        name,
        animationUrl,
        contentType: animationUrl ? 'video/mp4' : 'image/png',
        price: new BN(price).isZero() ? undefined : price,
        image,
        stubImage: stubImage || 'rmrk.svg',
        link: buildKodadotLink(id, 'stmn')
      }
    })

    const parsedNfts = await Promise.all(promise)

    return parsedNfts
  }

  return []
}
