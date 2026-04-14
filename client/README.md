# Client

Vue 3 + Vite frontend for the Laser Machine App.

## Commands

Install dependencies:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run the client component tests:

```bash
npm test
```

Preview the production build:

```bash
npm run preview
```

## Environment

This app uses:

```env
VITE_API_BASE_URL=/api
```

The local env file is:

```text
client/.env
```

The example template is:

```text
client/.env.example
```

## Notes

- During local development, Vite proxies `/api` requests to `http://localhost:4000`.
- The main project setup and full-stack run instructions are documented in the root `README.md`.
