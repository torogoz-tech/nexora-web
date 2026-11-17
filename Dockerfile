# syntax=docker/dockerfile:1.7

FROM web-dist AS compiled-web

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY --from=compiled-web / /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --output-document=- http://127.0.0.1:8080/health || exit 1
