FROM node:18-alpine as builder

WORKDIR /smart_monitoring_frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm","start"]