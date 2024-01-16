import express from 'express'
import cors from 'cors'
import timeout from 'connect-timeout'
import { reqTimeoutSecs, port, allowedOrigins } from './constant/env'
import { newLogger } from '@subsocial/utils'

import { createRoutes } from './routes'
import { Connections } from './connections'
import { getOrCreateRedisCache } from './cache/redisCache'
import { validatorStakingInfoCache } from './services/validatorStaking'
import { relayChains } from './services/crowdloan/types'

require('dotenv').config()

const log = newLogger('HTTP server')

export const startHttpServer = (apis: Connections) => {
  const app = express()

  const redisCache = getOrCreateRedisCache()
  const redis = redisCache.getOrCreateRedisInstance()

  app.use(express.static('public'))

  app.use(
    cors((req, callback) => {
      const corsOptions = { origin: true }
      const origin = req.header('Origin')
      const isAllowedOrigin = allowedOrigins.some((allowedOrigin) =>
        origin?.includes(allowedOrigin)
      )
      if (!isAllowedOrigin) {
        corsOptions.origin = false
      }
      callback(null, corsOptions)
    })
  )

  // For localhost testing
  // app.use(
  //   cors((req, callback) => {
  //     const origin = req.method === 'GET' ? '*' : '*'
  //     callback(null, { origin })
  //   })
  // )

  function haltOnTimedout(req: express.Request, _res: express.Response, next) {
    if (!req.timedout) next()
  }

  app.use(timeout(`${reqTimeoutSecs}s`))

  // for parsing application/json
  app.use(express.json())
  app.use(haltOnTimedout)

  // for parsing application/xwww-form-urlencoded
  app.use(express.urlencoded({ extended: true }))
  app.use(haltOnTimedout)

  app.use('/api/v1', createRoutes(apis))

  app.use(function (err, _req, res, _next) {
    log.error(JSON.stringify(err.stack))
    res.status(500).send(err.stack)
  })

  redis?.on('error', (error: any) => {
    if (redisCache.isConnectionClosed) return
    log.warn('Error connecting to redis', error?.message)
  })

  redis?.on('close', async () => {
    if (redisCache.isConnectionClosed) return
    redisCache.setIsRedisReady(false)
    redisCache.setIsConnectionClosed(true)

    log.warn('Redis connection closed')
  })

  redis?.on('connect', async () => {
    log.info('Redis connected')
    redisCache.setIsConnectionClosed(false)

    await redisCache.checkConnection({ showLogs: true });

    relayChains.forEach((network) => {
      validatorStakingInfoCache.set(network, undefined)
    })
  })

  // for parsing multipart/form-data
  // const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })
  // app.use(express.static('./email/templates'))
  app.listen(port, () => {
    log.info(`HTTP server started on port ${port}`)
  })
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason)
  // Application specific logging, throwing an error, or other logic here
})
