import { newLogger } from '@subsocial/utils'
import { checkConnection, redisCallWrapper } from './redisCache'

const log = newLogger('Cache data')

export const getRedisKey = (prefix: string, key: string) => `${prefix}:${key}`

const getLastUpdate = (prefix: string) => `${prefix}:last-update-time`

class Cache<T extends any> {
  private cache: T = {} as any
  private lastUpdate = undefined
  private ttlSeconds: number = undefined
  private prefix: string = ''

  constructor(prefix: string, ttlSeconds: number) {
    checkConnection({ showLogs: false}).then((isRedisReady) => {
      if (isRedisReady) {
        redisCallWrapper((redis) => redis?.set(getLastUpdate(prefix), new Date().getTime()))
      } else {
        this.lastUpdate = new Date().getTime()
      }
    })

    this.ttlSeconds = ttlSeconds
    this.prefix = prefix
  }

  needUpdate = async () => {
    const now = new Date().getTime()
    const isRedisReady = await checkConnection({ showLogs: false })

    const lastUpdate = isRedisReady
      ? await redisCallWrapper((redis) => redis?.get(getLastUpdate(this.prefix)))
      : this.lastUpdate

    if (now > parseInt(lastUpdate || '0') + this.ttlSeconds) {
      log.debug('Update properties')
      await redisCallWrapper((redis) => redis?.set(getLastUpdate(this.prefix), now))
      return true
    }

    return false
  }

  get = async (key: string) => {
    const isRedisReady = await checkConnection({ showLogs: false })

    if (isRedisReady) {
      const result = await redisCallWrapper(async (redis) =>
        redis?.get(getRedisKey(this.prefix, key))
      )

      return result ? (JSON.parse(result) as T) : undefined
    } else {
      return this.cache[key]
    }
  }

  set = async <E extends any>(key: string, value: E) => {
    const isRedisReady = await checkConnection({ showLogs: false })
    
    if (isRedisReady) {
      await redisCallWrapper((redis) =>
        redis?.set(getRedisKey(this.prefix, key), JSON.stringify(value))
      )
    } else {
      this.cache[key] = value
    }
  }

  getAllValues = async (keys: string[]): Promise<any> => {
    const isRedisReady = await checkConnection({ showLogs: false })
    if (isRedisReady) {
      return redisCallWrapper<Record<string, T>>(async (redis) => {
        const resultPromise = keys.map(async (key) => {
          const data = await redis.get(getRedisKey(this.prefix, key))
          return JSON.parse(data)
        })

        const result = await Promise.all(resultPromise)

        const data = {}

        keys.forEach((key, i) => {
          data[key] = result[i]
        })

        return data
      })
    } else {
      const data = {}

      keys.forEach((key) => {
        data[key] = this.cache[key]
      })

      return data
    }
  }
}

export default Cache
