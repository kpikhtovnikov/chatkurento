FROM node:14.17.1-alpine3.13

COPY . /app
WORKDIR /app

RUN apk add git
RUN npm i

CMD ["npm", "run", "start"]
