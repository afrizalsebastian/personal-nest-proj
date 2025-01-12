FROM node:20
RUN apk add --no-cache python3 make gcc g++ openssl

WORKDIR /app

COPY package.json yarn.lock  ./

RUN npm install -g @nestjs/cli && \
    yarn install && \
    npm rebuild bcrypt --build-from-source

COPY . .

RUN npx prisma generate && \
    npm run build

RUN chmod +x wait-for-it.sh

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080
CMD ['/usr/local/bin/docker-entrypoint.sh']

