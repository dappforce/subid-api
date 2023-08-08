import { getOrCreateRedisCache } from './cache/redisCache'
import { createConnections } from './connections'
import { startHttpServer } from './server'

const start = async () => {
  getOrCreateRedisCache()
  const apis = await createConnections()
  startHttpServer(apis)
}

start()