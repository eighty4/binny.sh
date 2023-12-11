ARG INSTALL_DEPENDENCY
FROM install.template.test.debian.bash.${INSTALL_DEPENDENCY:-UNSET}

RUN apt-get install -y zsh

ENV SHELL /bin/zsh

CMD ["/bin/zsh"]
