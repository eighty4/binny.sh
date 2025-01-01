# install.eighty4.tech (unfortunately not install.sh)

## Development

The frontend and lambdas packages will require environment variables
with [GitHub client credentials for a GitHub OAuth application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
See each package's .env file for environment variable names.

Use these commands to run Install.sh locally:

| Package  | Command          |
|----------|------------------|
| lambdas  | l3 sync          |
| frontend | pnpm dev         |

APIs are deployed to AWS Lambdas with [eighty4/l3](https://github.com/eighty4/l3).
For development, Vite will proxy API requests to AWS Lambda.
`l3 sync` must be run before starting the frontend Vite server. 

Database features are currently disabled to migrate the backend to a serverless deployment.
Unit tests, however, are still ran against Postgres.

Use `docker compose up -d --wait` and run `backend/sql/v001-init-schema.sql` before running `pnpm test` for the backend.

### Offline development

Auth and features are dependent on GitHub APIs and thus require network connectivity during development.
Offline mode is used by e2e tests and also for developing with static and predictable data.

Data for offline mode is stubbed out in [//offline/src/data.ts](offline/src/data.ts).

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

Here is a list of install scripts for popular applications that inspired Install.sh:

- [Astral uv](https://docs.astral.sh/uv/getting-started/installation/)
- [Astral ruff](https://docs.astral.sh/ruff/installation/)
- [Homebrew](https://brew.sh/)
- [pnpm](https://pnpm.io/installation/)
- [rustup](https://rustup.rs/)
- [Wasmtime](https://wasmtime.dev/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
