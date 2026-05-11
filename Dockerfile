FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# bust docker layer cache on every build
ARG BUILD_DATE
RUN echo "$BUILD_DATE"
RUN npm run build

FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY generate-env.js ./generate-env.js
EXPOSE 8080
CMD ["sh", "-c", "node generate-env.js && serve dist -l ${PORT:-8080} -s"]
