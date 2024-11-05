FROM gcr.io/distroless/nodejs22-debian12

ARG COMMIT="(not set)"
ARG LASTMOD="(not set)"
ENV COMMIT=$COMMIT
ENV LASTMOD=$LASTMOD

USER nonroot
COPY --chown=nonroot:nonroot ./server.mjs /app/
COPY --chown=nonroot:nonroot ./static /app/static

WORKDIR /app
ENTRYPOINT ["/nodejs/bin/node", "server.mjs"]
