ARG HTTP_CLIENT

FROM binny.test.debian.bash.$HTTP_CLIENT

ARG HTTP_CLIENT

RUN echo $HTTP_CLIENT

RUN if [ -z "$HTTP_CLIENT" ]; then \
    echo "ERROR: build arg HTTP_CLIENT is required" >&2; \
    exit 1; \
fi

RUN apt-get install -y fish
RUN mkdir -p ~/.config/fish && touch ~/.config/fish/config.fish

ENV SHELL=/bin/fish

CMD ["/bin/fish"]
