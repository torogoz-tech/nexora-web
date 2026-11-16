# Nexora Web

Nexora Web is the human-facing React and TypeScript application for the Nexora platform. It helps people explore repositories, analysis profiles, code context, documents, knowledge, tasks, workflows, approvals, integrations, and release context.

## Architecture and stewardship

Nexora's architecture and initial implementation are led by [Abner Velasco](https://www.linkedin.com/in/abnervelasco/), who is also responsible for the ongoing maintenance and evolution of this repository.

## Human interface

The application is bilingual: users can work in English or Spanish. Localization changes labels, navigation, guidance, validation messages, and other presentation text. It does not move authorization into the browser or change repository, snapshot, evidence, or workflow identities.

## What the web client does

The browser composes authenticated screens and calls the Nexora API. It presents platform state; it does not become the authority for permissions, ownership, revision checks, or approval decisions. The API must validate every protected operation.

## Development

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
```

The application expects `/api` to be routed to a Nexora API instance. Provider secrets and private repository data must never be placed in frontend code or browser storage.

The web client is version `0.1.0`. Its version must remain aligned with the API contract it consumes and is governed by the ecosystem's SemVer and compatibility policy.

## Read the web guide

- [Product experience](docs/product-experience.md)
- [Web architecture](docs/architecture.md)
- [User workflows](docs/user-workflows.md)
- [Development guide](docs/development.md)
- [Security boundary](docs/security.md)

## Layout

- `src/app/` application composition, authentication, navigation, and providers.
- `src/components/` reusable UI components.
- `src/pages/` route-level screens.
- `src/services/` API and browser service boundaries.
- `tests/` component, contract, security, and interaction tests.
- `docs/` web-specific product, development, and security guidance.

## License

MIT. See `LICENSE`.
