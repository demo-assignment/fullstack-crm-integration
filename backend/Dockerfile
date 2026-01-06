FROM oven/bun:1.1.45 AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.1.45 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Produces dist/index.js
RUN bun run build

FROM oven/bun:1.1.45 AS runner
WORKDIR /app

ENV NODE_ENV=production

# App reads these at runtime:
# - PORT
# - ALLOWED_URLS
# - NOTION_TOKEN
# - NOTION_DATA_SOURCE_ID
# - MAX_FILTER_DEPTH (optional)

COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
