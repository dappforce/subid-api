import Queue from 'bull'

let queue = null

export const getOrCreateQueue = () => {
  if (!queue) {
    const host = process.env.AGGREGATOR_REDIS_HOST
    const password = process.env.AGGREGATOR_REDIS_PASSWORD
    const port = process.env.AGGREGATOR_REDIS_PORT as unknown as number

    const aggregatorRedisConfig = {
      host,
      password,
      port
    }

    queue = new Queue('ACCOUNT_AGGREGATION_FLOW', {
      redis: aggregatorRedisConfig,
      prefix: process.env.AGGREGATOR_REDIS_PREFIX,
      settings: {
        lockDuration: 35000, // Check for stalled jobs each 3.5 min
        lockRenewTime: 10000,
        stalledInterval: 20 * 60 * 1000,
        maxStalledCount: 1
      }
    })
  }

  return queue
}
