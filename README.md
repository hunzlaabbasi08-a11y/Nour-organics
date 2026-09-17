# Nour Organics

Storefront + API in one app. Database is **Neon PostgreSQL**. Production host is **Railway**.

## Local development

1. Create a Neon project at [console.neon.tech](https://console.neon.tech) and copy the connection string (`Connect` → URI, with `sslmode=require`).
2. Copy `server/.env.example` to `server/.env` and paste it:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
JWT_SECRET=a-long-random-string
ADMIN_EMAIL=admin@nourorganics.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Nour Admin
```

3. Install and run:

```bash
cd server
npm install
npm run db:init
npm run db:seed
npm run dev
```

```bash
cd web
npm install
npm run dev
```

- Store: http://127.0.0.1:5173
- API: http://127.0.0.1:3001
- Admin: http://127.0.0.1:5173/admin/login

Default admin: `admin@nourorganics.com` / `admin123`

The Vite dev server proxies `/api` to the Node server. Leave `web/.env` `VITE_API_URL` empty.

## Deploy to Railway + Neon

### 1. Neon database

1. Create a project in Neon (region close to Railway, e.g. both in `us-east` or `eu-west`).
2. Copy the connection string. Prefer the **pooled** URI if it includes `-pooler`.

### 2. GitHub repo

Railway deploys from Git. From the project root:

```bash
git init
git add .
git commit -m "Ready for Railway"
```

Create a GitHub repo and push this project.

### 3. Railway service

1. Go to [railway.app](https://railway.app) → **New project** → **Deploy from GitHub repo**.
2. Railway will detect `Dockerfile` and `railway.toml`.
3. Open **Variables** and set:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Long random string (not the local default) |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD` | Strong admin password |
| `ADMIN_NAME` | Display name |
| `NODE_ENV` | `production` |

`PORT` is set by Railway. Do not set `VITE_API_URL` — the API and store share the same domain, so the browser calls `/api`.

4. Click **Generate domain** on the service (Settings → Networking).
5. Redeploy if the first boot ran before variables were saved.

On boot the server creates tables, upserts the admin user, and inserts catalog products if they are missing. After that, admin stock/price edits are kept.

### 4. Check it

- Store: `https://your-app.up.railway.app`
- Health: `https://your-app.up.railway.app/api/health`
- Admin: `https://your-app.up.railway.app/admin/login`

## Features

- Add to cart (local cart + drawer)
- Checkout → saves order in PostgreSQL
- Admin dashboard, orders, product stock/price edits
