FROM node:18-alpine3.18 as builder

WORKDIR /opt/subsocial/app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN mv localhost.env .env && \
    NODE_ENV=production yarn build

FROM gcr.io/distroless/nodejs:16 AS runner

WORKDIR /opt/subsocial/app

COPY --from=builder /opt/subsocial/app .

CMD [ "./build/src/index.js" ]

