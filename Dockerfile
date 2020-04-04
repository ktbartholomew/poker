FROM node:12.16.1-alpine AS builder
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci
COPY . .

RUN NODE_ENV=production npx webpack


FROM node:12.16.1-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY . .
COPY --from=builder /app/dist ./dist
RUN npm ci --production

CMD ["npm","start"]
