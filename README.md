# Quantumverse Backend (NestJS 11 + MySQL + JWT)

This is a minimal, production-ready NestJS 11 backend implementing authentication (JWT) and role-based access control for two roles: `student` and `admin`.

## Features

- Register (student)
- Login (JWT)
- Get current user (`/auth/me`)
- Admin-only users listing (`/users`)
- MySQL + TypeORM integration
- Password hashing with bcrypt
- Role-based guard and decorator
- Auto-creates an admin on boot from `.env` if `ADMIN_EMAIL`/`ADMIN_PASSWORD` set

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy the `.env` example and update values:
```bash
cp .env.example .env
# Edit DB credentials and JWT secret
```

3. Ensure your MySQL database exists:
```sql
CREATE DATABASE quantumverse;
```

4. Run the app:
```bash
npm run start:dev
```

- App: http://localhost:3000

## Endpoints

- POST `/auth/register`
```json
{ "email": "stud1@example.com", "password": "MyStrongPass1!" }
```

- POST `/auth/login`
```json
{ "email": "stud1@example.com", "password": "MyStrongPass1!" }
```
Response:
```json
{
  "accessToken": "jwt-token",
  "user": { "id": 1, "email": "stud1@example.com", "role": "student", "createdAt": "...", "updatedAt": "..." }
}
```

- GET `/auth/me` (requires `Authorization: Bearer <token>`)

- GET `/users` (admin only; requires admin JWT)

## Notes

- In development, TypeORM synchronize is enabled. Disable in production and use migrations.
- An admin user is auto-created on startup if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are present in `.env`.
- To change roles logic, see:
  - `src/users/user.entity.ts` (UserRole)
  - `src/auth/decorators/roles.decorator.ts`
  - `src/common/guards/roles.guard.ts`

## Security

- Change `JWT_SECRET` and never commit real `.env`.
- Use strong passwords and HTTPS in production.

## Tests

Add unit/e2e tests as needed. Jest config is already included.