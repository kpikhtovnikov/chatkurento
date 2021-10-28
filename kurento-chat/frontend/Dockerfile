FROM node:14.17.1-alpine3.13

ARG REACT_APP_SOCKET_ENDPOINT

COPY . /app
WORKDIR /app

RUN npm i
RUN npm run build

CMD ["npm", "run", "serve"]
