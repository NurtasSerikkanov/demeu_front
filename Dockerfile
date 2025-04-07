# Билдим приложение
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

# Сервер на nginx
FROM nginx:stable-alpine

# копируем билд в папку nginx
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# дефолтная конфигурация
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
