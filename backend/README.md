# GG Sports API

## Local setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run seed
npm run dev
```

The API runs at `http://localhost:4000`.

Seeded admin:

- Email: `admin@ggsports.in`
- Password: `ChangeMe123!`

Change `ADMIN_PASSWORD` and `ADMIN_EMAIL` in `.env` before using the backend outside local development.

## Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/content`
- `GET /api/content/:id`
- `GET /api/v1/content`
- `GET /api/v1/content/:id`
- `POST /api/admin/content`
- `PATCH /api/admin/content/:id`
- `DELETE /api/admin/content/:id`
- `POST /api/leads`
- `GET /api/admin/leads`
- `PATCH /api/admin/leads/:id`
- `GET /api/admin/users`
- `POST /api/admin/users` — body: `{ name, email, password }`
- `DELETE /api/admin/users/:id` — removes an admin's access (cannot remove yourself or the last admin)

Admin endpoints require an `Authorization: Bearer <accessToken>` header.

## JSON catalog

`data/content.json` is the source catalog used by `npm run seed`. Add or update
entries there, then run:

```bash
npm run seed
```

The public REST API returns JSON from the database and supports filtering:

```bash
curl "http://localhost:4000/api/v1/content?type=SERVICE"
```
