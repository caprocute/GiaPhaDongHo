# syntax=docker/dockerfile:1
# Build context: repo root
# docker build -f frontend/apps/admin/Dockerfile -t giapha-admin .

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo

COPY design-tokens ./design-tokens
COPY frontend ./frontend

WORKDIR /repo/design-tokens
RUN npm install && npm run build

WORKDIR /repo/frontend
RUN pnpm install --frozen-lockfile

ARG VITE_API_BASE_URL=
ARG VITE_OIDC_AUTHORITY=
ARG VITE_OIDC_CLIENT_ID=giapha_admin
ARG VITE_DEFAULT_TREE_SLUG=ho-hoang
# Link "Cổng thông tin" + preview bài viết trỏ về portal — thiếu là fallback localhost:3000.
ARG VITE_PORTAL_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY \
    VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID \
    VITE_DEFAULT_TREE_SLUG=$VITE_DEFAULT_TREE_SLUG \
    VITE_PORTAL_URL=$VITE_PORTAL_URL

RUN pnpm --filter @giapha/admin build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /repo/frontend/apps/admin/dist /usr/share/nginx/html
COPY frontend/apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ || exit 1
