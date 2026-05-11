FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["sh", "-c", "echo \"window.__env__ = { VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}', VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}' };\" > /app/dist/env-config.js && serve dist -l ${PORT:-8080} -s"]
