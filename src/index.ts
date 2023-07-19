import { createConnections } from './connections'
import { initializeRedis } from './redisCache'
import { startHttpServer } from './server'

const start = async () => {
  initializeRedis()
  const apis = await createConnections()
  startHttpServer(apis)
}

start()