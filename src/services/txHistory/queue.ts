import Queue from 'bull'

let queue = null

export const getOrCreateQueue = () => {
  if (!queue) {
    const aggregatorRedisConfig = {
      host: process.env.AGGREGATOR_REDIS_HOST || '',
      password: process.env.AGGREGATOR_REDIS_PASSWORD || '',
      port: (process.env.AGGREGATOR_REDIS_PORT as unknown as number) || 0
    }

    queue = new Queue('ACCOUNT_AGGREGATION_FLOW', {
      redis: aggregatorRedisConfig,
      prefix: process.env.AGGREGATOR_REDIS_PREFIX,
      settings: {
        lockDuration: 20000, // Check for stalled jobs each 2 min
        lockRenewTime: 10000,
        stalledInterval: 20 * 60 * 1000,
        maxStalledCount: 1
      }
    })
  }

  return queue
}
