import { Router } from 'express'
import { Connections } from '../../connections'
import {
  getCreatorRewards,
  getCreatorsEraStake,
  getGeneralEraInfo,
  getGeneralBackerInfo,
  getBackerLocksByAccount,
  getBackerRewards
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

  router.get('/backer/info', async function (req, res) {
    const { account, ids } = req.query
    const info = await getGeneralBackerInfo({
      apis: apis.mixedApis,
      account: account as string,
      spaceIds: ids as string
    })

    res.send(info)
  })

  router.get('/backer/ledger', async function (req, res) {
    const { account } = req.query
    const info = await getBackerLocksByAccount({
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

  router.get('/backer/rewards', async function (req, res) {
    const { account, ids } = req.query

    const info = await getBackerRewards({
      account: account as string,
      spaceIds: ids as string
    })

    res.send(info)
  })

  router.get('/rewards', async function (req, res) {
    const { id } = req.query

    const info = await getCreatorRewards({
      spaceId: id as string
    })

    res.send(info)
  })

  return router
}

export default createCreatorStakingRouter
