FROM node:20.1.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# TypeScript 프로젝트 JavaScript로 컴파일
RUN npm run build

# dbmate 설치
RUN wget https://github.com/amacneil/dbmate/releases/download/v1.12.1/dbmate-linux-musl-amd64 -O /usr/local/bin/dbmate && \
    chmod +x /usr/local/bin/dbmate

# 어플리케이션 실행을 위한 엔트리포인트 설정
ENTRYPOINT ["node", "dist/server.js"]