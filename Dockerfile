FROM node:22-alpine as builder
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . /app

RUN npm run client:generate
RUN npm run build



FROM node:22-alpine as app
WORKDIR /app

COPY package.json ./
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/generated /app/generated


CMD ["npm", "run", "start:prod"]