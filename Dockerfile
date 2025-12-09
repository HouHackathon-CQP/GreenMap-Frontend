# Copyright 2025 HouHackathon-CQP
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
