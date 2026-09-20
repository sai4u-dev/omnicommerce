# ─── builder (install deps) ───
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY src ./src

# ─── runner (production) ───
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
# ensure data dir exists for file DB
RUN mkdir -p src/data && chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" || wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
