# 빌드 스테이지
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 런타임 스테이지
FROM node:24-alpine

WORKDIR /app

USER node

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app .

EXPOSE ${WS_PORT}

CMD ["npm", "start"]