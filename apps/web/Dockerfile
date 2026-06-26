FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma/
COPY packages/graphql/package.json ./packages/graphql/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm install && npm run codegen && npm run dev -w @life/web -- --hostname 0.0.0.0"]
