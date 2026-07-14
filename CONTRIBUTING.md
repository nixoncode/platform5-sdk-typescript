# Contributing

## Prerequisites

- Node.js 18+
- npm

## Setup

```sh
npm install
npm run build
```

## Development

```sh
npm run dev        # watch mode (if available)
npm run typecheck  # check types
npm run lint       # check lint
npm run format     # format code
```

## Testing

```sh
npm test
```

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run `npm run build && npm run typecheck && npm run lint && npm test`
3. Update documentation if adding or changing features
4. Open a PR against `main` with a clear description

## Code Style

- TypeScript strict mode
- No semicolons
- Double quotes
- Trailing commas
- 120 character line width

These are enforced by ESLint and Prettier.
