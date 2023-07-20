import { createConnections } from './connections'
import { getRedisInstance } from './redisCache'
import { startHttpServer } from './server'

const start = async () => {
  getRedisInstance()
  const apis = await createConnections()
  startHttpServer(apis)
}

start()