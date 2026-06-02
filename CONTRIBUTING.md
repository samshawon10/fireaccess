# Contributing to FireAccess

Thank you for helping improve FireAccess.

## How to Contribute

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the local checks.
5. Open a pull request with a clear summary.

## Development Setup

```bash
npm install
```

Run the core checks:

```bash
npm run lint
npm run typecheck
npm test
```

Run the full package check:

```bash
npm run ci
```

## Integration Tests

MongoDB integration tests are skipped unless `FIREACCESS_INTEGRATION_MONGO_URI` is set.

```bash
FIREACCESS_INTEGRATION_MONGO_URI="mongodb://127.0.0.1:27017/fireaccess-test" npm test
```

## Pull Request Guidelines

* Keep changes focused and small.
* Add or update tests for behavior changes.
* Keep public APIs backward compatible when possible.
* Update `README.md` and `CHANGELOG.md` when user-facing behavior changes.
* Do not commit build artifacts, package tarballs, `.env` files, or `node_modules`.

## Reporting Issues

Please include:

* FireAccess version
* Node.js version
* Express, Firebase Admin, and Mongoose versions
* A short reproduction or code example
* The expected behavior and actual behavior

Issues and feature requests:

https://github.com/samshawon10/fireaccess/issues
