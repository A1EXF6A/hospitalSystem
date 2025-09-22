# Etapa 1: Compilar TypeScript
FROM node:20 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Etapa 2: Ejecutar app compilada
FROM node:20

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

RUN npm install --only=production

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
