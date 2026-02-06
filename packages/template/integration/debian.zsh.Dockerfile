ARG HTTP_CLIENT

FROM binny.test.debian.bash.$HTTP_CLIENT

ARG HTTP_CLIENT

RUN echo $HTTP_CLIENT

RUN if [ -z "$HTTP_CLIENT" ]; then \
    echo "ERROR: build arg HTTP_CLIENT is required" >&2; \
    exit 1; \
fi

RUN apt-get install -y zsh

ENV SHELL=/bin/zsh

CMD ["/bin/zsh"]
