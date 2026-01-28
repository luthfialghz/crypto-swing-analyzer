FROM node:20-alpine

WORKDIR /app

# Set Timezone to Asia/Jakarta
RUN apk add --no-cache tzdata
ENV TZ=Asia/Jakarta

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]
