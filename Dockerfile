FROM node:14 AS build
WORKDIR /build
COPY . .
RUN npm install
RUN npm run build

FROM nginx
COPY --from=build /build/dist/ /usr/share/nginx/html/
RUN ls /usr/share/nginx/html
COPY docker-entrypoint.sh /
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["sh","/docker-entrypoint.sh"]