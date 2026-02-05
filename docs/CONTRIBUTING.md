# Contributing to Binny.sh

## Project structure

[eighty4/binny.sh](https://github.com/eighty4/binny.sh) has 3 user-facing vendored outputs: a CLI, an AWS Lambda API layer & the webapp at https://binny.sh.

Sources within the webapp are either imported with a TypeScript path alias `Binny.sh/*` that maps to this repo's `lib` directory where
sources for Binny's frontend are imported from. Any sources that are reused by the CLI or Lambdas are configured as NPM packages, will
be found in the `packages` directory and will use a `@binny.sh/*` import path.

An example of frontend code using sources from both frontend lib `Binny.sh/*` and NPM packages is: [ProfilePicture.ts](/lib/components/ProfilePicture.ts).

### NPM packages

Exports from NPM packages should be as isolated as possible to improve optimization of bundling and code-splitting.
A package should not export all APIs comprehensively from a library exports module. With that package structure,
it is not possible to import a single API from the library without including the entire package in the bundle.

Preference configuring individual exports in `package.json` to improve frontend optimization.
