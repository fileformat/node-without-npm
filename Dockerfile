FROM gcr.io/distroless/nodejs22-debian12

USER nonroot
COPY --chown=nonroot:nonroot ./server.mjs /app/
COPY --chown=nonroot:nonroot ./static /app/static

WORKDIR /app
ENTRYPOINT ["/nodejs/bin/node", "server.mjs"]
