# syntax=docker/dockerfile:1.7
#
# MYMarkaz Frontend — production Docker image (multi-stage, Next.js standalone).
# Tamoyillar: kichik & xavfsiz yakuniy image, non-root, fail-fast build-arg.
# MUHIM: NEXT_PUBLIC_* qiymatlar BUILD PAYTIDA kodga muhrlanadi — image har muhit
# uchun o'z API URL'i bilan quriladi (deploy.yml build-arg orqali beradi).

############################################################
# 0) base — umumiy Node muhiti
############################################################
FROM node:24-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

############################################################
# 1) deps — lockfile bo'yicha aniq o'rnatish
############################################################
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

############################################################
# 2) build — Next.js production build (standalone)
############################################################
FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NODE_ENV=production
# Fail-fast: API URL berilmasa image localhost'ga qurilib prod'da sindiradi —
# shuning uchun build shu yerdayoq to'xtaydi.
RUN test -n "$NEXT_PUBLIC_API_URL" \
  || (echo "XATO: NEXT_PUBLIC_API_URL build-arg majburiy (masalan https://api.mymarkaz.uz/api)" && exit 1)
RUN npm run build

############################################################
# 3) runner — yakuniy minimal, non-root image
############################################################
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3330 \
    HOSTNAME=0.0.0.0
# Faqat standalone server + static assetlar (minimal node_modules ichida).
COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/.next/static ./.next/static

USER node
EXPOSE 3330

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3330)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
