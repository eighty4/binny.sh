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

# Create PR via APIs

## Create branch

### Get HEAD sha of a branch

`GET /repos/{owner}/{repo}/git/ref/heads/{branch_name}`

### Create branch from HEAD commit

`POST /repos/{owner}/{repo}/git/refs`

```json
{
    "ref": "refs/heads/YOUR_NEW_BRANCH_NAME",
    "sha": "COMMIT_SHA_TO_BRANCH_FROM"
}
```

### Create pull request

[API docs](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#create-a-pull-request)

## todos

- remove vitest from template
- review ci_verify workflow and script
- template version compiled by ts uses require() which won't work in browser
