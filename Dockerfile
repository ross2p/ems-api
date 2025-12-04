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
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/generated /app/generated

EXPOSE 3000
CMD ["npm", "run", "start:prod"]