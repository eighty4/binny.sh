# install.eighty4.tech (unfortunately not install.sh)

## Development

The frontend and backend packages will require a .env.development file
with [GitHub client credentials for a GitHub OAuth application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
See each package's .env file for environment variable names.

| Package  | Command          |
|----------|------------------|
| frontend | pnpm dev         |
| backend  | pnpm build:watch |
| backend  | pnpm start:watch |
| backend  | pnpm test:watch  |

Database features are currently disabled to migrate the backend to a serverless deployment. Unit tests, however, are
still ran against Postgres.

Use `docker compose up -d --wait` and run `backend/sql/v001-init-schema.sql` before running `pnpm test` for the backend.

### Offline development

Auth and features are dependent on GitHub APIs and thus require network connectivity during development.

These commands will stub API dependencies for offline development of the frontend:

| Package  | Command          |
|----------|------------------|
| frontend | pnpm dev:offline |
| offline  | pnpm start       |

Selfies and #installsh tweets while developing on an airplane, on safari, or in a James Cameron-funded submersible
expedition are appreciated!

### Interactive update with `pnpm`

The update command can be used interactively and recursively to upgrade project dependencies:

```bash
pnpm update --interactive --latest --recursive
```

## Example install scripts in the wild

Here is a list of install scripts for popular applications:

- [Homebrew](https://brew.sh/)
- [pnpm](https://pnpm.io/installation/)
- [rustup](https://rustup.rs/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
