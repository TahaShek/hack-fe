# CLAUDE.md — E-Commerce Platform (Multi-Vendor Marketplace)

## Project Overview

A full-stack multi-vendor e-commerce marketplace with three separate portals:
- **Seller Portal** — Manage products, inventory, orders, promotions, and analytics
- **Buyer App** — Browse, search, purchase, and track orders
- **Admin Panel** — Moderate users, products, orders, and platform analytics

Plus a real-time **Chat Module** and four **AI/ML features**.

---

## Architecture

```
project-root/
├── frontend/          # Next.js (React) — Buyer App + Seller Portal + Admin Panel

└── CLAUDE.md
```

### Frontend — Next.js (App Router)
```
frontend/
├── app/
│   ├── (buyer)/           # Buyer-facing pages
│   │   ├── page.tsx                   # Home / Landing Page
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   ├── products/page.tsx          # Product Listing
│   │   ├── products/[id]/page.tsx     # Product Detail
│   │   ├── wishlist/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── payment/page.tsx
│   │   ├── order-confirmation/page.tsx
│   │   └── dashboard/page.tsx         # Buyer Dashboard
│   ├── (seller)/          # Seller-facing pages
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/add/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── promotions/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── (admin)/           # Admin-facing pages
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── transactions/page.tsx
│   │   └── analytics/page.tsx
│   └── chat/page.tsx      # Chat module (shared)
├── components/
│   ├── buyer/
│   ├── seller/
│   ├── admin/
│   ├── chat/
│   └── shared/            # Reusable components (Button, Input, Modal, etc.)
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api.ts             # Axios instance with interceptors
│   └── utils.ts
├── store/                 # Zustand or Redux Toolkit global state
└── types/                 # TypeScript interfaces and types
```

### Backend — Node.js + Express
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── buyer.controller.ts
│   │   ├── seller.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── chat.controller.ts
│   │   └── ai.controller.ts
│   ├── routes/
│   ├── models/            # Mongoose schemas
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification
│   │   └── role.middleware.ts     # Role-based access (buyer/seller/admin)
│   ├── services/
│   │   ├── recommendation.service.ts
│   │   ├── search.service.ts
│   │   ├── pricing.service.ts
│   │   └── chatbot.service.ts
│   └── utils/
├── .env
└── server.ts
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (Access + Refresh Tokens) |
| Real-time Chat | Socket.IO |
| File Uploads | Multer + Cloudinary |
| State Management | Zustand (preferred) or Redux Toolkit |
| API Client | Axios with interceptors |
| Charts | Recharts or Chart.js |
| AI/ML | Python microservice or integrated JS logic (see AI section) |

---

## Authentication & Authorization

### JWT Strategy
- Issue **access token** (15 min expiry) and **refresh token** (7 days expiry) on login
- Store access token in memory (React state or Zustand), refresh token in `httpOnly` cookie
- Every protected API request sends `Authorization: Bearer <access_token>` header
- Implement a refresh endpoint: `POST /api/auth/refresh`

### Roles
Three user roles, each with separate login flows and protected routes:
- `buyer` — Access to buyer routes only
- `seller` — Access to seller routes only
- `admin` — Access to admin routes only

### Middleware Pattern
```typescript
// backend/src/middleware/auth.middleware.ts
// 1. Extract token from Authorization header
// 2. Verify with jwt.verify()
// 3. Attach decoded user (id, role) to req.user
// 4. Pass to role.middleware.ts to enforce role-based access
```

---

## MongoDB Models

### User (Buyer)
```
_id, fullName, email, phone, passwordHash, role: "buyer",
addresses[], wishlist[], createdAt
```

### Seller
```
_id, storeName, ownerName, email, phone, passwordHash, role: "seller",
businessAddress, bankDetails{}, storeLogoUrl, storeDescription, createdAt
```

### Admin
```
_id, email, passwordHash, role: "admin"
```

### Product
```
_id, sellerId (ref: Seller), name, description, category, price,
discountPrice, variants[], skuCode, stockQuantity, images[],
isApproved: Boolean, isFlagged: Boolean, ratings[], createdAt
```

### Order
```
_id, buyerId (ref: User), items[{productId, quantity, price}],
shippingAddress{}, deliveryMethod, paymentMethod, paymentStatus,
orderStatus: ["pending","confirmed","packed","shipped","delivered","returned"],
trackingId, totalAmount, couponApplied, createdAt
```

### Coupon
```
_id, sellerId, code, discountType: ["percentage","flat"],
discountValue, minOrderAmount, startDate, endDate, isActive
```

### Transaction
```
_id, orderId, buyerId, amount, status: ["success","failed","refunded"],
paymentMethod, createdAt
```

### ChatMessage
```
_id, conversationId, senderId, receiverId, senderRole,
message, imageUrl, isSeen, createdAt
```

### Conversation
```
_id, participants[{userId, role}], lastMessage, updatedAt
```

---

## API Endpoints

### Auth Routes — `/api/auth`
```
POST /register/buyer
POST /register/seller
POST /login/buyer
POST /login/seller
POST /login/admin
POST /refresh
POST /logout
```

### Buyer Routes — `/api/buyer`
```
GET    /profile
PUT    /profile
GET    /wishlist
POST   /wishlist/:productId
DELETE /wishlist/:productId
GET    /orders
GET    /orders/:orderId
POST   /orders/:orderId/return
```

### Seller Routes — `/api/seller`
```
GET    /dashboard
GET    /products
POST   /products
PUT    /products/:id
DELETE /products/:id
POST   /products/bulk-upload       # Excel import
GET    /inventory
PUT    /inventory/:productId
GET    /orders
PUT    /orders/:id/status
GET    /analytics
GET    /coupons
POST   /coupons
PUT    /coupons/:id
DELETE /coupons/:id
```

### Admin Routes — `/api/admin`
```
GET    /dashboard
GET    /users
PUT    /users/:id/block
GET    /products/pending
PUT    /products/:id/approve
PUT    /products/:id/reject
GET    /orders
GET    /transactions
GET    /analytics
```

### Product Routes — `/api/products` (public)
```
GET    /              # Listing with filters & pagination
GET    /:id           # Product detail
GET    /search        # Search with autocomplete
GET    /categories
```

### Cart & Checkout Routes — `/api/cart`
```
GET    /
POST   /items
PUT    /items/:productId
DELETE /items/:productId
POST   /apply-coupon
```

### Payment Routes — `/api/payment`
```
POST   /initiate
POST   /confirm
GET    /status/:orderId
```

### Chat Routes — `/api/chat`
```
GET    /conversations
GET    /conversations/:conversationId/messages
POST   /conversations/:conversationId/messages
```

### AI Routes — `/api/ai`
```
GET    /recommendations          # Personalized product recommendations
GET    /search/autocomplete      # NLP search suggestions
POST   /pricing/suggest          # Dynamic pricing suggestion for sellers
POST   /chatbot                  # Chatbot message handler
```

---

## Key Screen Implementation Notes

### Seller Dashboard
- Fetch summary stats in a single `GET /api/seller/dashboard` call returning: `{ totalSales, totalOrders, pendingOrders, lowStockAlerts }`
- Render a weekly/monthly sales graph using **Recharts** `<LineChart>` or `<BarChart>`
- Poll or use WebSocket for low stock alerts in real time

### Product Management
- Use `react-hook-form` + `zod` for add/edit product form validation
- Excel bulk upload: use `xlsx` (SheetJS) on the frontend to parse the file, then send parsed JSON to `POST /api/seller/products/bulk-upload`
- Image uploads: send files to backend via `multipart/form-data`, store on Cloudinary, save returned URLs in MongoDB

### Inventory Management
- Display stock levels in a table with color-coded indicators: green (>10), yellow (≤10), red (0)
- Bulk update: allow CSV/Excel import for updating quantities

### Orders Management (Seller)
- Status pipeline: `Confirmed → Packed → Shipped`
- Allow seller to paste a tracking ID when marking as Shipped

### Buyer Home Page
- Implement **real-time search** with debounce (300ms) calling `GET /api/products/search?q=`
- Featured products and promotional banners fetched from admin-configured data

### Cart & Checkout
- Persist cart in MongoDB for logged-in users, localStorage for guests
- Merge guest cart with user cart on login
- Coupon validation done server-side, never trust client-calculated discounts

### Payment
- Integrate in **sandbox/test mode** (e.g., Stripe test keys or a mock payment service)
- Always verify payment status server-side before marking order as paid

### Real-Time Chat (Socket.IO)
- On connect, join a room named by `conversationId`
- Emit `message:send` → broadcast to room → emit `message:receive` to other participant
- Persist every message to MongoDB via the chat controller
- Mark messages as seen when recipient opens the conversation

---

## AI / ML Features

### 1. Product Recommendation System
**Approach:** Collaborative filtering or content-based using browsing/purchase history.

- **"Recommended for You"** on Home Page — call `GET /api/ai/recommendations` with `buyerId` in JWT; return top-N products based on past purchases and wishlist
- **"Customers Also Bought"** on Product Detail Page — call `GET /api/ai/recommendations?productId=` to return related products
- Simple starting implementation: track `productViews` and `purchases` per user in MongoDB; recommend products frequently bought together using aggregation pipelines
- Advanced: integrate a Python microservice using `scikit-learn` (cosine similarity or matrix factorization)

### 2. Intelligent Search Autocomplete (NLP-Based)
**Approach:** Fuzzy matching + MongoDB Atlas Search or a local Trie-based structure.

- Debounce user input (300ms), then call `GET /api/products/search/autocomplete?q=`
- Backend: use **MongoDB Atlas Search** with fuzzy matching enabled (`{ fuzzy: { maxEdits: 1 } }`) to handle typos like "iphon" → "iPhone"
- Return suggestions: matched product names, categories, and top popular searches
- Store popular search terms in a `SearchLog` collection and surface them when input is empty

### 3. Dynamic Pricing Suggestions for Sellers
**Approach:** Rule-based with market data signals.

- When seller adds or edits a product, call `POST /api/ai/pricing/suggest` with `{ category, currentPrice, stockQuantity }`
- Backend compares against average price of same category products in the DB
- Return: `{ suggestedMin, suggestedMax, message }` — e.g., "Similar products sell between PKR 1,200–1,800. Your price may be too high."
- Show a non-blocking inline alert below the price field in the product form

### 4. AI Chatbot for Customer Support
**Approach:** Rule-based intent matching with order system integration; optionally backed by an LLM API.

- Trigger: floating chat icon on buyer-facing pages
- Intents to handle:
  - `order_status` — fetch order from DB using `orderId` extracted from message
  - `return_request` — guide user to return flow
  - `delivery_charges` — return static/configured info
  - `escalate` — hand off to human seller/admin chat
- Simple implementation: keyword-based intent classifier in `chatbot.service.ts`
- Advanced: call OpenAI or Anthropic API with a system prompt containing order context
- Always offer an "Talk to a human" fallback option

---

## Coding Conventions

- Use **TypeScript** strictly — no `any` types; define interfaces in `types/`
- Follow **REST conventions**: plural nouns, proper HTTP verbs, consistent response shape:
  ```json
  { "success": true, "data": {}, "message": "..." }
  ```
- All passwords hashed with **bcryptjs** (salt rounds: 12) before storing
- Never return `passwordHash` in any API response — exclude it explicitly in Mongoose queries with `.select('-passwordHash')`
- Use **async/await** with try/catch; never leave unhandled promise rejections
- All environment variables in `.env`; never hardcode secrets
- Validate all incoming request bodies server-side using **Zod** or **express-validator**
- Frontend: co-locate component styles with Tailwind utility classes; avoid global CSS except for resets
- Use Next.js **Server Components** for data-fetching pages and **Client Components** only where interactivity is needed (forms, charts, real-time)

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PAYMENT_SANDBOX_KEY=...
CLIENT_URL=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Development Commands

```bash
# Backend
cd backend && npm install
npm run dev        # ts-node-dev with hot reload

# Frontend
cd frontend && npm install
npm run dev        # Next.js dev server on port 3000
```

---

## Security Checklist
- [ ] Passwords hashed with bcryptjs before saving
- [ ] JWT secrets stored in `.env`, never in code
- [ ] Role-based middleware on every protected route
- [ ] Input validation on all POST/PUT endpoints
- [ ] No sensitive fields returned in API responses
- [ ] CORS configured to allow only `CLIENT_URL`
- [ ] Rate limiting on auth routes (`express-rate-limit`)
- [ ] HTTP-only cookies for refresh tokens
- [ ] Payment handled in sandbox/test mode only