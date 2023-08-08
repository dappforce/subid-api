import Redis from 'ioredis'
import { createRedisInstance, redisLogs } from './utils'

let redisCache: RedisCache | undefined = undefined

type CheckConnectionProps = {
  showLogs: boolean
}

class RedisCache {
  private _isRedisReady = false
  private _isConnectionClosed = true
  private _redis: Redis | undefined = undefined

  constructor() {
    this._redis = createRedisInstance()
  }

  checkConnection = async ({ showLogs }: CheckConnectionProps) => {
    if (!this._isRedisReady) {
      try {
        await this._redis.get('status')
        this._isRedisReady = true
        showLogs && redisLogs.info('Redis is ready')
      } catch {
        this._isRedisReady = false
        showLogs && redisLogs.warn('Redis is not ready. Check your configuration')
      }
    }

    return this._isRedisReady
  }

  getOrCreateRedisInstance = () => {
    if (!this._redis) {
      this._redis = createRedisInstance()
    }

    this.checkConnection({ showLogs: true })

    return this._redis
  }

  isConnectionClosed = () => this._isConnectionClosed
  setIsConnectionClosed = (isConnectionClosed: boolean) => {
    this._isConnectionClosed = isConnectionClosed
  }

  isRedisReady = () => this._isRedisReady
  setIsRedisReady = (isRedisReady: boolean) => {
    this._isRedisReady = isRedisReady
  }
}


export const getOrCreateRedisCache = () => {
  if(!redisCache) {
    redisCache = new RedisCache()
  }

  return redisCache
}
