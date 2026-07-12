FROM node:20-alpine AS development
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY web/package.json ./web/
RUN pnpm install

COPY packages/db/src ./packages/db/src
COPY packages/shared/src ./packages/shared/src
COPY packages/server/src ./packages/server/src

EXPOSE 3001
CMD ["pnpm", "--filter", "@lms/server", "dev"]