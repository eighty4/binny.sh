ARG INSTALL_DEPENDENCY
FROM install.template.test.debian.bash.${INSTALL_DEPENDENCY:-UNSET}

RUN apt-get install -y fish
RUN mkdir -p ~/.config/fish && touch ~/.config/fish/config.fish

ENV SHELL /bin/fish

CMD ["/bin/fish"]
