# Nexora Web

Nexora Web is the React and TypeScript browser application for the Nexora platform. It uses Vite, React Router, Tailwind CSS, daisyUI, Monaco, and Vitest.

## Development

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

The application expects `/api` to be routed to a Nexora API instance. Provider secrets and private repository data must never be placed in frontend code or browser storage.

## Layout

- `src/app/` application composition, authentication, navigation, and providers.
- `src/components/` reusable UI components.
- `src/pages/` route-level screens.
- `src/services/` API and browser service boundaries.
- `tests/` component, contract, security, and interaction tests.
- `docs/` web-specific operational and security guidance.

Authorization remains server-side. Some screens require corresponding API routes and deployment configuration.

## License

MIT. See `LICENSE`.
