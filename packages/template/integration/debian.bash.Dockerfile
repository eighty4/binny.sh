FROM debian

ARG HTTP_CLIENT

RUN if [ -z "$HTTP_CLIENT" ]; then \
    echo "ERROR: build arg HTTP_CLIENT is required" >&2; \
    exit 1; \
fi

RUN rm -f /usr/bin/curl /usr/bin/wget && apt-get update && apt-get install -y ${HTTP_CLIENT}

ENV SHELL=/bin/bash

WORKDIR /gold
COPY gold/scripts scripts
COPY integration/test.sh test.sh
RUN chmod +x /gold/scripts/*.sh /gold/test.sh
