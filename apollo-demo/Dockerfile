FROM node:14-alpine AS build-env
COPY server.js /app/
COPY run.js /app/
COPY package*.json /app/
WORKDIR /app
RUN npm ci --only=production

FROM node:14-alpine
COPY --from=build-env /app /app
WORKDIR /app
EXPOSE 4000
CMD ["run.js", "server.js"]
