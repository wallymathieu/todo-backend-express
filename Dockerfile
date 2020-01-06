FROM node:10-alpine

ENV PORT=5000
# RUN apk add python make gcc g++

WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm ci --production

COPY dist /usr/src/app

CMD [ "node", "server.js" ]
