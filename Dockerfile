FROM node:20-alpine as build

WORKDIR /install.sh
COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm i
RUN pnpm --filter @eighty4/install-frontend build && mv frontend/dist backend/public
RUN pnpm --filter @eighty4/install-backend build
RUN pnpm --filter @eighty4/install-backend --prod deploy dist

FROM node:20-alpine

WORKDIR /install.sh
COPY --from=build /install.sh/dist /install.sh

EXPOSE 5741

CMD ["node", "lib/Server.js"]
