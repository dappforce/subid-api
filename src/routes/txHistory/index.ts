import { Router } from 'express'
import { getAccountTxHistory, getAccountTxHistoryWithQueue } from '../../services/txHistory'

const createTxHistoryRouter = () => {
  const router = Router()

  router.get('/history/queue', async function (req, res) {
    const { address, pageSize, offset } = req.query
    const txs = await getAccountTxHistoryWithQueue({
      address: address as string,
      pageSize: parseInt(pageSize as string),
      offset: parseInt(offset as string),
    })

    res.send(txs)
  })

  router.get('/history', async function (req, res) {
    const { address, pageSize, offset, networks, events } = req.query
    const txs = await getAccountTxHistory({
      address: address as string,
      pageSize: parseInt(pageSize as string),
      offset: parseInt(offset as string),
      networks: networks as string[],
      events: events as string[],
    })

    res.send(txs)
  })

  return router
}

export default createTxHistoryRouter
