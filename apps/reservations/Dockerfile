FROM node:alpine As development

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY package.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/reservations/prisma ./prisma

RUN npm install

RUN npx prisma generate

COPY apps/reservations apps/reservations
COPY libs libs

RUN npm run build reservations

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --prod

COPY --from=development /usr/src/app/dist ./dist

CMD ["npm", "run", "start:prod", "dist/apps/reservations/main"]