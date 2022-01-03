FROM node:16 as build-stage

WORKDIR /app

COPY ./web/package.json .
RUN npm install

COPY ./web .
RUN npm run build

FROM nginx

COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 3000

CMD nginx -g 'daemon off;'
