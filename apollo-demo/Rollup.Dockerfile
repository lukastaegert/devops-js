FROM node:14-alpine AS build-env
WORKDIR /app
COPY . /app
RUN npx rollup server.js --file server.js --plugin node-resolve --plugin commonjs --plugin json --format cjs 2> /dev/null

FROM node:14-alpine
WORKDIR /app
EXPOSE 4000
COPY --from=build-env /app/server.js /app/
COPY --from=build-env /app/run.js /app/
CMD ["run.js"]
