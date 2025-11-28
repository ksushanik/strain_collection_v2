# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
ENV NODE_ENV=development
COPY frontend/package*.json ./
RUN npm ci

FROM deps AS build
COPY frontend ./
COPY docs/wiki ./docs/wiki
ARG NEXT_PUBLIC_API_URL=http://localhost
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PRIVATE_SKIP_TURBOPACK=1
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/docs/wiki /docs/wiki
COPY --from=build /app/package*.json ./
EXPOSE 3001
CMD ["npm", "run", "start", "--", "-p", "3001"]
