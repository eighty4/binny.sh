# install.eighty4.tech (unfortunately not install.sh)

## Development

| Package  | Command  |
|----------|----------|
| frontend | pnpm dev |
| backend  | pnpm dev |

Database features are currently disabled to migrate the backend to a serverless environment.

### Offline development

Auth and features are dependent on GitHub APIs and thus require network connectivity during development.

These commands will stub API dependencies for offline development:

| Package  | Command          |
|----------|------------------|
| frontend | pnpm dev:offline |
| offline  | pnpm dev         |

Selfies and #installsh tweets while developing on an airplane, on safari, or in a James Cameron-funded submersible expedition are appreciated!

## Example install scripts in the wild

Here is a list of install scripts for popular applications:

- [Homebrew](https://brew.sh/)
- [pnpm](https://pnpm.io/installation/)
- [rustup](https://rustup.rs/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
