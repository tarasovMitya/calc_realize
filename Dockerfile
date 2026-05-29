FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
# Install deps and Playwright Chromium in one cached layer (only re-runs on package.json change)
RUN npm ci && npx playwright install chromium --with-deps
# Railway injects RAILWAY_GIT_COMMIT_SHA — busts cache on every deploy
ARG RAILWAY_GIT_COMMIT_SHA=unknown
RUN echo "Building commit: $RAILWAY_GIT_COMMIT_SHA"
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.js ./server.js
EXPOSE 8080
CMD ["node", "server.js"]
