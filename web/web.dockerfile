FROM node:16 as build-stage

WORKDIR /app

COPY . .
RUN yarn install && yarn build 

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build-stage /app/build .

ENTRYPOINT ["nginx", "-g", "daemon off;"]
