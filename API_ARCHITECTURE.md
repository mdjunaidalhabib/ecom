# OpenUpBD API Architecture

## Before

```txt
Browser -> https://backend-domain.com/api-or-route
```

Problem: the backend URL was visible in the browser Network tab and client-side code depended on `NEXT_PUBLIC_API_URL`.

## After

```txt
Browser -> /api/products -> Next.js server proxy -> BACKEND_API_URL/products
Browser -> /api/admin/orders -> Next.js server proxy -> BACKEND_API_URL/admin/orders
Browser -> /api/api/invoice/:id -> Next.js server proxy -> BACKEND_API_URL/api/invoice/:id
```

## Files added

- `frontend/src/app/api/[...path]/route.js`
- `admin/src/app/api/[...path]/route.js`

These route handlers forward `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, and `HEAD` requests to the backend.

## Required environment variable

Set this in both frontend and admin deployment environments:

```env
BACKEND_API_URL=https://your-backend-domain.com
```

Do not expose the backend URL with a `NEXT_PUBLIC_` prefix.
