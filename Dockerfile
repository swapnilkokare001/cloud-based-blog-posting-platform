# ──────────────────────────────────────────────────────────
# Stage 1: Install dependencies
# ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# ──────────────────────────────────────────────────────────
# Stage 2: Build
# ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (non-secret public vars only)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun run build

# ──────────────────────────────────────────────────────────
# Stage 3: Production runner (minimal image)
# ──────────────────────────────────────────────────────────
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed for standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
