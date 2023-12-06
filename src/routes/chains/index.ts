import { Router } from 'express'

import { Apis } from '../../connections/networks/types'
import { getNetworksProperties } from '../../services/properties'
import { getCirculatingSupplyByNetwork, getTotalSupplyByNetwork } from '../../services/supply'

const createChainsRouter = (apis: Apis) => {
  const router = Router()

  router.get('/properties', async function (_req, res) {
    const propertiesByNetwork = await getNetworksProperties({ apis })
    res.send(propertiesByNetwork)
  })

  router.get('/:network/supply/total', async function (req,res) {
    const { network } = req.params
    const api = apis[network]
    const totalSupply = await getTotalSupplyByNetwork(api, network)
    res.send(totalSupply)
  })

  router.get('/:network/supply/circulating', async function (req,res) {
    const { network } = req.params
    const api = apis[network]
    const totalSupply = await getCirculatingSupplyByNetwork(api, network)
    res.send(totalSupply)
  })

  return router
}

export default createChainsRouter