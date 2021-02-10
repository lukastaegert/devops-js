FROM node:14-alpine AS build-env
WORKDIR /app
COPY server.js /app/
COPY run.js /app/
COPY package*.json /app/
RUN npm ci --only=production > /dev/null

FROM node:14-alpine
WORKDIR /app
EXPOSE 4000
COPY --from=build-env /app /app
CMD ["run.js"]
