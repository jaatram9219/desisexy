# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

# Install all deps (including devDeps) for building
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY . .

# Generate Prisma client (needs a dummy URL at build time — real URL set via env at runtime)
ENV DATABASE_URL="file:./dev.db"
ENV TURSO_DATABASE_URL="file:./dev.db"
RUN npx prisma generate

# Build Next.js (disable telemetry)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Production image — lean and fast
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone Next.js output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
