import { Router } from 'express'
import { Connections } from '../../connections'
import {
  getCreatorsEraStake,
  getGeneralEraInfo,
  getGeneralStakerInfo,
  getStakerLedger,
  getStakerRewards
} from '../../services/creatorStaking'
import { getCreatorsList } from '../../services/creatorStaking/creatorsList'
import { getCreatorsSpacesInfo } from '../../services/creatorStaking/creatorsSpaces'
import { getStakingConsts } from '../../services/creatorStaking/stakingConsts'

const createCreatorStakingRouter = (apis: Connections) => {
  const router = Router()

  router.get('/list', async function (_req, res) {
    const info = await getCreatorsList({ apis: apis.mixedApis })

    res.send(info)
  })

  router.get('/era/info', async function (_req, res) {
    const info = await getGeneralEraInfo({ apis: apis.mixedApis })

    res.send(info)
  })

  router.get('/spaces/info', async function (req, res) {
    const { ids } = req.query
    const info = await getCreatorsSpacesInfo({ spaceIds: ids as string[] })

    res.send(info)
  })

  router.get('/era/stake', async function (req, res) {
    const { era, ids } = req.query
    const info = await getCreatorsEraStake({
      apis: apis.mixedApis,
      era: era as string,
      spaceIds: ids as string
    })

    res.send(info)
  })

  router.get('/staker/info', async function (req, res) {
    const { account, ids } = req.query
    const info = await getGeneralStakerInfo({
      apis: apis.mixedApis,
      account: account as string,
      spaceIds: ids as string
    })

    res.send(info)
  })

  router.get('/staker/ledger', async function (req, res) {
    const { account } = req.query
    const info = await getStakerLedger({
      apis: apis.mixedApis,
      account: account as string
    })

    res.send(info)
  })

  router.get('/consts', async function (_req, res) {
    const info = await getStakingConsts({
      apis: apis.mixedApis
    })

    res.send(info)
  })

  router.get('/staker/rewards', async function (req, res) {
    const { account, ids } = req.query

    const info = await getStakerRewards({
      account: account as string,
      spaceIds: ids as string
    })

    res.send(info)
  })

  return router
}

export default createCreatorStakingRouter