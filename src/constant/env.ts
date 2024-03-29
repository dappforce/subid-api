export const reqTimeoutSecs = 60

export const allowedOrigins = [ 'sub.id', 'polkaverse.com', 'subsocial.network', 'grill.chat', 'grillapp.net' ] // process.env.CORS_ALLOWED_ORIGIN?.split(',').map(x => x.trim()) || ['http://localhost']

export const port = process.env.OFFCHAIN_SERVER_PORT || 3001

export const SEC = 1000

export const wsReconnectTimeout = parseInt(process.env.WS_RECONNECT_TIMEOUT || '15') * SEC
