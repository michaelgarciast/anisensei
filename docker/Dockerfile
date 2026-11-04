FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM deps AS dev
EXPOSE 3000
CMD ["bun", "run", "dev", "-H", "0.0.0.0"]

FROM deps AS build
COPY . .
RUN bun run build

FROM node:22-alpine AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN mkdir -p .next/cache && chown node .next/cache
USER node
EXPOSE 3000
CMD ["node", "server.js"]
