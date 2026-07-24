# syntax=docker/dockerfile:1
# Build context: repo root
# docker build -f frontend/apps/portal/Dockerfile -t giapha-portal .

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo

COPY design-tokens ./design-tokens
COPY frontend ./frontend

WORKDIR /repo/design-tokens
RUN npm install && npm run build

WORKDIR /repo/frontend
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_BASE_URL=
ARG NEXT_PUBLIC_DEFAULT_TREE_SLUG=ho-hoang
# OIDC cho đăng nhập portal — thiếu là fallback localhost:18086/realms/jhipster (dev),
# gây lỗi "Không kết nối được máy chủ xác thực".
ARG NEXT_PUBLIC_OIDC_AUTHORITY=
ARG NEXT_PUBLIC_OIDC_CLIENT_ID=giapha_portal
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_DEFAULT_TREE_SLUG=$NEXT_PUBLIC_DEFAULT_TREE_SLUG \
    NEXT_PUBLIC_OIDC_AUTHORITY=$NEXT_PUBLIC_OIDC_AUTHORITY \
    NEXT_PUBLIC_OIDC_CLIENT_ID=$NEXT_PUBLIC_OIDC_CLIENT_ID

RUN pnpm --filter @giapha/portal build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /repo/frontend/apps/portal/public ./apps/portal/public
COPY --from=builder --chown=nextjs:nodejs /repo/frontend/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/frontend/apps/portal/.next/static ./apps/portal/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/portal/server.js"]
