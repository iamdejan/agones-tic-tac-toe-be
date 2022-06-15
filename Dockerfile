FROM node:18-bullseye-slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .
RUN yarn lint && yarn build

EXPOSE 4000
CMD ["yarn", "start"]
