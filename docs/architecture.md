# Web Architecture

The web client is a presentation layer for Nexora. Route-level pages compose reusable components, services communicate with the API, and authentication state is kept within the browser session boundary.

The browser does not decide authorization. The API must validate every protected operation, resource scope, revision, and idempotency key.
