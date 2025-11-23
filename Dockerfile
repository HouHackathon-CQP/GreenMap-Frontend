# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

# Cài dependency
COPY package.json package-lock.json ./
RUN npm ci

# 🔹 Đảm bảo .env được copy vào image để Vite đọc khi build
COPY .env .env

# Copy source code frontend
COPY . .

# Build production (Vite sẽ dùng VITE_BASE_URL từ .env ở đây)
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

# Dùng serve để phục vụ thư mục dist
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
