# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV NODE_ENV=development
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
# Provide a default value to satisfy prisma generate; override at runtime.
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/strain_collection_v2?schema=public"
RUN npx prisma generate

FROM deps AS build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build
# Compile seed script for production use
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --esModuleInterop --skipLibCheck

FROM deps AS prod-deps
RUN npm prune --omit=dev

FROM base AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=prod-deps /app/prisma ./prisma
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/src/main.js"]

