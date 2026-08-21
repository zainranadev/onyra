<<<<<<< HEAD
# Onyra — Premium Mini E-Commerce Web App

A full-stack, portfolio-quality e-commerce application: a React/TypeScript storefront with an Express/MongoDB API behind it. Built as a demo store for a fictional brand (**Onyra** — considered, well-made everyday tech and carry goods).

No real payment processor is integrated anywhere — checkout is clearly labeled as a demo.

---

## Project overview

```
onyra/
├── client/     React + TypeScript + Vite + Tailwind storefront & admin
├── server/     Express + TypeScript + MongoDB/Mongoose REST API
└── README.md
```

## Features

**Storefront**
- Home with hero, featured categories, featured products, promo banner, benefits, newsletter
- Shop page: search, category filter, sort (featured / price / newest / rating), pagination, desktop sidebar + mobile filter drawer
- Product detail: gallery, quantity selector, stock states, reviews with rating distribution, related products, sticky purchase panel
- Persistent cart (localStorage) with a slide-out drawer + full cart page; quantity is clamped to available stock
- Wishlist (localStorage) with heart toggle everywhere a product appears
- Checkout: validated customer/shipping/delivery form, coupon field, order summary — server recalculates every total
- Order success page + order history
- About, Contact (validated form), custom 404
- Toasts, skeleton loaders, empty states, and error states with retry, throughout
- Dark-mode-ready color tokens (see `tailwind.config.js`) — see *Future improvements*
- Responsive from 360px up; mobile nav drawer, mobile filter drawer, mobile-friendly cart

**Admin** (`/admin`)
- Dashboard with live stats (products, orders, revenue, low stock, customers)
- Product management: searchable table, create/edit modal with validation, delete with confirmation
- Order management: search, filter by status, inline status updates

**Engineering**
- Centralized API client + typed service layer (`services/`)
- Zod validation on both client (React Hook Form) and server
- Consistent `{ success, data, message }` / `{ success, error, message }` API envelope
- Global error boundary + centralized Express error handler
- Cart/order math is never trusted from the client — the server recalculates subtotal, discount, tax, and shipping on every order
- Route-level code splitting for the admin bundle

## Tech stack

- **Client:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, React Hook Form + Zod, Lucide icons, Axios
- **Server:** Node.js, Express, TypeScript, MongoDB + Mongoose, Zod, express-rate-limit

---

## Getting started

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment variables

```bash
# server/.env
cp server/.env.example server/.env
```
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/onyra
CLIENT_URL=http://localhost:5174
NODE_ENV=development
```

```bash
# client/.env
cp client/.env.example client/.env
```
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the database

```bash
cd server
npm run seed
```
This creates 6 categories, 15 products (with realistic stock/pricing, including a couple of low-stock and out-of-stock items so those states are visible), and 2–4 reviews per product.

### 5. Run the app

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Storefront: http://localhost:5174
API health check: http://localhost:5000/api/health

### 6. Build for production

```bash
cd server && npm run build && npm start
cd client && npm run build && npm run preview
```

---

## API documentation

Base URL: `/api`. All responses use the envelope `{ success, data, message }` (or `{ success, message, error }` on failure).

| Method | Route | Description |
|---|---|---|
| GET | `/products` | List products — `?search=&category=&sort=&page=&limit=` |
| GET | `/products/featured` | Featured products for the homepage |
| GET | `/products/:slug` | Product detail + reviews + related products |
| POST | `/products` | Create product *(admin)* |
| PUT | `/products/:id` | Update product *(admin)* |
| DELETE | `/products/:id` | Delete product *(admin)* |
| GET | `/categories` | List categories with live product counts |
| GET | `/categories/:slug` | Single category |
| POST | `/orders` | Place an order — validates stock, recalculates totals server-side, decrements stock |
| GET | `/orders` | List orders — `?status=&search=` |
| GET | `/orders/:id` | Single order |
| PUT | `/orders/:id/status` | Update order status *(admin)* |
| GET | `/admin/stats` | Dashboard summary stats *(admin)* |

Sort values: `featured`, `price_asc`, `price_desc`, `newest`, `rating`.
Coupon codes recognized at checkout (demo only): `WELCOME10` (10% off), `SAVE20` (20% off).

## Admin access (demo)

There's no real login system yet (see below). Admin-only endpoints are gated by a demo header, `x-demo-role: admin`, which the client's admin service layer already sends automatically. Visiting `/admin` in the browser works out of the box in this build; it is **not** secured for a real deployment.

---

## Implemented vs. future improvements

**Implemented:** everything listed under Features above, including full CRUD, cart/wishlist persistence, search/filter/sort/pagination, checkout with server-side pricing, and the admin dashboard.

**Documented as future improvements** (scaffolded but intentionally out of scope for this build, per the "no fake buttons — document gaps clearly" requirement):
- **Real authentication** — the server has a role-check middleware (`middleware/adminOnly.ts`) ready to swap for real JWT/session verification; there's no signup/login flow or password hashing yet.
- **Real payment gateway** — checkout is explicitly a demo; no Stripe/PayPal integration.
- **Recently viewed products / product comparison / quick view modal** — not built in this pass.
- **Dark mode toggle UI** — the color tokens and Tailwind `darkMode: "class"` config are in place; the toggle control and persisted preference aren't wired up yet.
- **SEO meta tags per route** — no `react-helmet`-style head management yet; would be a small addition once the app is deployed somewhere crawlable.
- **Image upload** — the product form takes an image URL rather than a file upload/CDN pipeline.

## Demo data note

Product photography is sourced from Unsplash via hot-linked URLs for demo purposes — replace with your own CDN-hosted assets before shipping this for real.
=======
# onyra
>>>>>>> 6df1f3fb0cd4f7b6d194079e4afc2d2697c7cda3
