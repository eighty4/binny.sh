FROM debian

ARG INSTALL_DEPENDENCY
RUN test -n "$INSTALL_DEPENDENCY" && \
    apt-get update && \
    apt-get install -y $INSTALL_DEPENDENCY

ENV SHELL /bin/bash

WORKDIR /gold
COPY gold/scripts scripts
COPY gold/install_test.sh install_test.sh
RUN chmod +x /gold/scripts/*.sh /gold/install_test.sh
