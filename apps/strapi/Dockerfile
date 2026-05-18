FROM node:24-alpine AS builder

RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
RUN npm install -g pnpm@10.33.0
WORKDIR /opt/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/strapi/package.json apps/strapi/package.json

RUN pnpm install --filter strapi --frozen-lockfile

COPY apps/strapi apps/strapi

WORKDIR /opt/app/apps/strapi
ENV NODE_ENV=production
RUN pnpm build

FROM node:24-alpine AS runner

RUN apk add --no-cache vips
RUN npm install -g pnpm@10.33.0

ENV NODE_ENV=production
ENV PATH=/opt/app/node_modules/.bin:/opt/app/apps/strapi/node_modules/.bin:$PATH

WORKDIR /opt/app

COPY --from=builder --chown=node:node /opt/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /opt/app/package.json ./package.json
COPY --from=builder --chown=node:node /opt/app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=node:node /opt/app/apps/strapi ./apps/strapi

USER node
WORKDIR /opt/app/apps/strapi

EXPOSE 1337
CMD ["pnpm", "start"]
