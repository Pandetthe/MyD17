FROM node:24-alpine
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN npm install -g node-gyp pnpm

WORKDIR /opt/app
RUN chown node:node /opt/app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml* ./
RUN pnpm install
ENV PATH=/opt/app/node_modules/.bin:$PATH

COPY --chown=node:node . .
RUN ["pnpm", "run", "build"]
EXPOSE 1337
CMD ["pnpm", "run", "develop"]