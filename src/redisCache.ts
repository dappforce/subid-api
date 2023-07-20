import Redis, { RedisOptions } from 'ioredis'
import { newLogger } from '@subsocial/utils'

const log = newLogger('Redis')

let redis: Redis | undefined = undefined
export let _isRedisReady = false
export let _isConnectionClosed = true

export function checkEnv(data: string | undefined, envName: string, throwError = false) {
  if (data === undefined && throwError) {
    throw new Error(`env ${envName} is not set`)
  }
  return data as string
}

function getRedisConfig() {
  const host = checkEnv(process.env.REDIS_HOST, 'REDIS_HOST')
  const port = checkEnv(process.env.REDIS_PORT, 'REDIS_PORT')
  const password = checkEnv(process.env.REDIS_PASSWORD, 'REDIS_PASSWORD')

  const parsedPort = parseInt(port)

  if (!host || !port || isNaN(parsedPort) || !password) {
    log.error('Redis configuration is not complete, need host, port, password')
    throw new Error('Redis configuration is not complete, need host, port, password')
  }

  return { host, port: parsedPort, password }
}

function createRedisInstance() {
  try {
    const config = getRedisConfig()

    const options: RedisOptions = {
      host: config.host,
      password: config.password,
      port: config.port,
      db: 2,

      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      commandTimeout: 250,
      retryStrategy: (times: number) => {
        return Math.min(times * 200, 1000)
      }
    }

    const redis = new Redis(options)

    redis?.on('error', () => { return })

    return redis
  } catch (e) {
    log.error(`Could not create a Redis instance`)
    return null
  }
}

type CheckConnectionProps = {
  showLogs: boolean
}

export const checkConnection = async ({ showLogs }: CheckConnectionProps) => {
  if (!_isRedisReady) {
    try {
      await redis.get('status')
      _isRedisReady = true
      showLogs && log.info('Redis is ready')
    } catch {
      _isRedisReady = false
      showLogs && log.warn('Redis is not ready. Check your configuration')
    }
  }

  return _isRedisReady
}

export const getRedisInstance = () => {
  if (!redis) {
    redis = createRedisInstance()
  }

  checkConnection({ showLogs: true })

  return redis
}

export const setIsRedisReady = (isRedisReady: boolean) => {
  _isRedisReady = isRedisReady
}

export const setIsConnectionClosed = (isConnectionClosed: boolean) => {
  _isConnectionClosed = isConnectionClosed
}

export async function redisCallWrapper<T = void>(
  callback: (redis: Redis | null) => Promise<T> | undefined
) {
  try {
    return await callback(redis)
  } catch (err: any) {
    log.warn('Operation failed', err?.message)
    return null
  }
}
