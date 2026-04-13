# Laser Machine App

A full-stack app for managing laser machine technical data.

It includes:
- a Vue 3 + Vite frontend
- an Express + MongoDB backend
- Excel import/export for machine records
- filtering, pagination, and machine management UI
- a small server test setup with `npm test`

## Project Structure

```text
laser-machine-app/
├── client/   # Vue frontend
├── server/   # Express API
└── package.json  # root test shortcuts
```

## Requirements

- Node.js 18+ recommended
- npm
- MongoDB running locally or a reachable MongoDB connection string

## Environment Files

This project uses local `.env` files.

Server:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/laser_machine_app
CORS_ORIGIN=http://localhost:5173
```

Client:

```env
VITE_API_BASE_URL=/api
```

Example files are included here:
- `server/.env.example`
- `client/.env.example`

Real `.env` files are ignored by Git.

## Install Dependencies

From the project root:

```bash
npm install --prefix client
npm install --prefix server
```

Or install them separately:

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

## Run The App

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Default URLs:
- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`

The Vite dev server proxies `/api` requests to the backend.
When you deploy the backend, set `CORS_ORIGIN` to your Vercel domain.

## Testing And Checks

Run everything from the project root:

```bash
npm test
```

This runs:
- server tests
- client production build

You can also run them separately:

```bash
npm run test:server
npm run test:client
```

Or directly:

```bash
cd server && npm test
cd client && npm run build
```

## Main Features

- create, edit, copy, and delete machines
- manage power options
- filter machine records
- paginate machine list
- export all machines to Excel
- export selected machines to Excel
- import machines from Excel

## API Notes

Main routes:
- `GET /api/health`
- `GET /api/powers`
- `POST /api/powers`
- `DELETE /api/powers/:id`
- `GET /api/machines`
- `GET /api/machines/:id`
- `POST /api/machines`
- `PUT /api/machines/:id`
- `DELETE /api/machines/:id`
- `GET /api/machines/export/excel/all`
- `POST /api/machines/export/excel/selected`
- `POST /api/machines/import/excel`

## Git

To initialize Git for this folder:

```bash
git init
git add .
git commit -m "Initial commit"
```

## Notes

- `server/.env` and `client/.env` stay local and should not be committed.
- `server/.env.example` and `client/.env.example` are safe to commit.
- The server test setup is intentionally lightweight and does not require a live MongoDB connection for the current smoke tests.
