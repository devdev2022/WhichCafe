FROM node:20.1.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# 어플리케이션 실행을 위한 엔트리포인트 설정
ENTRYPOINT ["node", "server.js"]