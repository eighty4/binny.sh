# binny.sh

## Development

The frontend and lambdas packages will require environment variables
with [GitHub client credentials for a GitHub OAuth application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
See each package's .env file for environment variable names.

### Interactive update with `pnpm`

The update command can be used interactively and recursively to upgrade project dependencies:

```bash
pnpm update --interactive --latest --recursive
```

## Example install scripts in the wild

Here is a list of install scripts for popular applications that inspired Binny.sh:

- [Astral uv](https://docs.astral.sh/uv/getting-started/installation/)
- [Astral ruff](https://docs.astral.sh/ruff/installation/)
- [Homebrew](https://brew.sh/)
- [pnpm](https://pnpm.io/installation/)
- [rustup](https://rustup.rs/)
- [Wasmtime](https://wasmtime.dev/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
