FROM node:20-alpine AS development
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY web/package.json ./web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY packages/server/package.json ./packages/server/
RUN pnpm install
COPY . .
EXPOSE 5173
CMD ["pnpm", "--filter", "@lms/web", "dev"]
