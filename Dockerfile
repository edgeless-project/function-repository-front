FROM node:20-alpine AS app-builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .
COPY ./tsconfig.json .
COPY ./postcss.config.js .
COPY ./tailwind.config.ts .
COPY ./components.json .
COPY ./next-env.d.ts .
COPY ./next.config.mjs .
COPY ./src ./src
COPY ./.env.production .
COPY ./public ./public

RUN npm install 
RUN npm run build

FROM node:20-alpine


RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY --from=app-builder /usr/src/app/.next ./.next
COPY --from=app-builder /usr/src/app/next-env.d.ts .
COPY --from=app-builder /usr/src/app/next.config.mjs .
COPY --from=app-builder /usr/src/app/.env.production .
COPY --from=app-builder /usr/src/app/package.json .
COPY --from=app-builder /usr/src/app/node_modules ./node_modules

COPY ./public ./public

EXPOSE 3000

COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh 

CMD ["/usr/src/app/entrypoint.sh"]