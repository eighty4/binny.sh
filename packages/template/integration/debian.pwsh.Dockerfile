ARG SHELL

FROM binny.test.debian.$SHELL.wget

ARG PWSH_VERSION

RUN if [ -z "$PWSH_VERSION" ]; then \
    echo "ERROR: build arg PWSH_VERSION is required" >&2; \
    exit 1; \
fi

ENV PWSH_VERSION=$PWSH_VERSION

RUN apt-get update && apt-get install -y libicu-dev

WORKDIR /gold
COPY integration/install_pwsh.sh /gold/install_pwsh.sh

RUN /gold/install_pwsh.sh
