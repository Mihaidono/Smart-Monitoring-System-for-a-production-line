#Stage 1
FROM node:18-alpine as builder

WORKDIR /smart_monitoring_frontend

COPY package.json .
RUN npm install
COPY . .
RUN npm run build

#Stage 2
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /smart_monitoring_frontend/build .

ENTRYPOINT ["nginx", "-g", "daemon off;"]
