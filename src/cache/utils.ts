import { Redis, RedisOptions } from "ioredis"
import { newLogger } from '@subsocial/utils';
import { getOrCreateRedisCache } from "./redisCache";

export const redisLogs = newLogger('Redis')

export function checkEnv(data: string | undefined, envName: string, throwError = false) {
  if (data === undefined && throwError) {
    throw new Error(`env ${envName} is not set`)
  }
  return data as string
}

export function getRedisConfig() {
  const host = checkEnv(process.env.REDIS_HOST, 'REDIS_HOST')
  const port = checkEnv(process.env.REDIS_PORT, 'REDIS_PORT')
  const password = checkEnv(process.env.REDIS_PASSWORD, 'REDIS_PASSWORD')

  const parsedPort = parseInt(port)

  if (!host || !port || isNaN(parsedPort) || !password) {
    redisLogs.error('Redis configuration is not complete, need host, port, password')
    throw new Error('Redis configuration is not complete, need host, port, password')
  }

  return { host, port: parsedPort, password }
}

export function createRedisInstance() {
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

    redis?.on('error', () => {
      return
    })

    return redis
  } catch (e) {
    redisLogs.error(`Could not create a Redis instance`)
    return null
  }
}

export async function redisCallWrapper<T = void>(
  callback: (redis: Redis | null) => Promise<T> | undefined
) {
  try {
    return await callback(getOrCreateRedisCache().getOrCreateRedisInstance())
  } catch (err: any) {
    redisLogs.warn('Operation failed', err?.message)
    return null
  }
}