FROM node:14-alpine AS build-env
WORKDIR /app
COPY package*.json /app/
RUN npm ci --only=production > /dev/null
COPY server.js /app/
COPY run.js /app/

FROM node:14-alpine
WORKDIR /app
EXPOSE 4000
COPY --from=build-env /app /app
CMD ["run.js"]
