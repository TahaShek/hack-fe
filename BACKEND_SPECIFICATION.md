# Backend Specification — NexaMarket Multi-Vendor Marketplace

> Generated from the frontend codebase. Models, routes, controllers, and services — no code.

---

## Directory Structure

```
backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   ├── db.ts
│   │   ├── cloudinary.ts
│   │   └── socket.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Seller.ts
│   │   ├── Admin.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   ├── Coupon.ts
│   │   ├── Transaction.ts
│   │   ├── Review.ts
│   │   ├── Conversation.ts
│   │   ├── ChatMessage.ts
│   │   ├── SearchLog.ts
│   │   ├── ProductView.ts
│   │   └── Notification.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── buyer.routes.ts
│   │   ├── seller.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── chat.routes.ts
│   │   └── ai.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── buyer.controller.ts
│   │   ├── seller.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── chat.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── recommendation.service.ts
│   │   ├── search.service.ts
│   │   ├── pricing.service.ts
│   │   ├── chatbot.service.ts
│   │   └── notification.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── order.validator.ts
│   │   ├── coupon.validator.ts
│   │   └── cart.validator.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── asyncHandler.ts
│   │   ├── generateToken.ts
│   │   └── slugify.ts
│   ├── seeds/
│   │   └── index.ts
│   └── types/
│       └── express.d.ts
├── .env
├── tsconfig.json
└── package.json
```

---

## MongoDB Models

### User (Buyer) — `models/User.ts`

| Field        | Type                | Notes                          |
| ------------ | ------------------- | ------------------------------ |
| fullName     | String              | required, trimmed              |
| email        | String              | required, unique, lowercase    |
| phone        | String              | required                       |
| passwordHash | String              | required, select: false        |
| role         | String              | enum: ['buyer'], default: buyer |
| status       | String              | enum: active, blocked, suspended |
| avatar       | String              | optional                       |
| addresses    | Address[]           | embedded subdocument array     |
| wishlist     | ObjectId[]          | ref → Product                  |
| timestamps   | createdAt, updatedAt |                               |

**Address subdocument:** fullName, phone, street, city, state, zipCode, country, isDefault

---

### Seller — `models/Seller.ts`

| Field            | Type                | Notes                          |
| ---------------- | ------------------- | ------------------------------ |
| storeName        | String              | required, trimmed              |
| ownerName        | String              | required, trimmed              |
| email            | String              | required, unique, lowercase    |
| phone            | String              | required                       |
| passwordHash     | String              | required, select: false        |
| role             | String              | enum: ['seller']               |
| status           | String              | enum: active, blocked, suspended |
| businessAddress  | Object              | street, city, state, zipCode, country |
| bankDetails      | Object              | accountNumber, routingNumber, accountHolder — all select: false |
| storeLogoUrl     | String              | optional                       |
| storeDescription | String              | optional                       |
| timestamps       | createdAt, updatedAt |                               |

---

### Admin — `models/Admin.ts`

| Field        | Type   | Notes                       |
| ------------ | ------ | --------------------------- |
| email        | String | required, unique, lowercase |
| passwordHash | String | required, select: false     |
| role         | String | enum: ['admin']             |
| timestamps   | createdAt, updatedAt |              |

---

### Product — `models/Product.ts`

| Field          | Type           | Notes                                    |
| -------------- | -------------- | ---------------------------------------- |
| sellerId       | ObjectId       | ref → Seller, required, indexed          |
| name           | String         | required, trimmed                        |
| slug           | String         | required, unique                         |
| description    | String         | required                                 |
| category       | String         | required, indexed                        |
| subcategory    | String         | optional                                 |
| price          | Number         | required, min: 0                         |
| compareAtPrice | Number         | optional (strikethrough price)           |
| variants       | Variant[]      | embedded array                           |
| skuCode        | String         | unique                                   |
| stockQuantity  | Number         | required, default: 0, min: 0            |
| images         | String[]       | Cloudinary URLs                          |
| rating         | Number         | 0–5, default: 0                          |
| reviewCount    | Number         | default: 0                               |
| isApproved     | Boolean        | default: false                           |
| isFlagged      | Boolean        | default: false                           |
| tags           | String[]       |                                          |
| timestamps     | createdAt, updatedAt |                                    |

**Variant subdocument:** name, type (size/color/material/custom), options[]
**VariantOption subdocument:** value, price (optional override), stock

**Indexes:** text index on (name, description, tags)

---

### Order — `models/Order.ts`

| Field           | Type           | Notes                                     |
| --------------- | -------------- | ----------------------------------------- |
| orderNumber     | String         | required, unique (format: NXM-10001)      |
| buyerId         | ObjectId       | ref → User, required, indexed             |
| buyerName       | String         | required                                  |
| sellerId        | ObjectId       | ref → Seller, required, indexed           |
| sellerName      | String         | required                                  |
| items           | OrderItem[]    | embedded array                            |
| shippingAddress | Object         | fullName, phone, street, city, state, zipCode, country |
| deliveryMethod  | String         | default: 'standard'                       |
| paymentMethod   | String         | required                                  |
| paymentStatus   | String         | enum: pending, completed, failed, refunded |
| orderStatus     | String         | enum: pending, confirmed, packed, shipped, delivered, cancelled |
| trackingId      | String         | optional                                  |
| subtotal        | Number         | required                                  |
| discount        | Number         | default: 0                                |
| shipping        | Number         | default: 0                                |
| tax             | Number         | default: 0                                |
| totalAmount     | Number         | required                                  |
| couponApplied   | String         | optional                                  |
| timestamps      | createdAt, updatedAt |                                      |

**OrderItem subdocument:** productId (ref → Product), productName, productImage, quantity, price, variants (Map of string)

---

### Cart — `models/Cart.ts`

| Field          | Type          | Notes                        |
| -------------- | ------------- | ---------------------------- |
| userId         | ObjectId      | ref → User, required, unique |
| items          | CartItem[]    | embedded array               |
| couponCode     | String        | optional                     |
| couponDiscount | Number        | default: 0                   |
| timestamps     | updatedAt     |                              |

**CartItem subdocument:** productId (ref → Product), quantity, selectedVariants (Map of string)

---

### Coupon — `models/Coupon.ts`

| Field          | Type     | Notes                          |
| -------------- | -------- | ------------------------------ |
| sellerId       | ObjectId | ref → Seller, required         |
| code           | String   | required, unique, uppercase    |
| discountType   | String   | enum: percentage, fixed        |
| discountValue  | Number   | required, min: 0               |
| minOrderAmount | Number   | default: 0                     |
| maxDiscount    | Number   | optional                       |
| usageLimit     | Number   | default: 100                   |
| usedCount      | Number   | default: 0                     |
| startDate      | Date     | required                       |
| endDate        | Date     | required                       |
| isActive       | Boolean  | default: true                  |
| timestamps     | createdAt |                               |

---

### Transaction — `models/Transaction.ts`

| Field            | Type     | Notes                                 |
| ---------------- | -------- | ------------------------------------- |
| orderId          | ObjectId | ref → Order, required                 |
| buyerId          | ObjectId | ref → User, required                  |
| sellerId         | ObjectId | ref → Seller, required                |
| buyerName        | String   | required                              |
| sellerName       | String   | required                              |
| amount           | Number   | required                              |
| platformFee      | Number   | required                              |
| sellerAmount     | Number   | required                              |
| status           | String   | enum: pending, completed, failed, refunded |
| paymentMethod    | String   | required                              |
| paymentGatewayId | String   | optional (Stripe payment_intent ID)   |
| timestamps       | createdAt |                                      |

---

### Review — `models/Review.ts`

| Field      | Type     | Notes                              |
| ---------- | -------- | ---------------------------------- |
| productId  | ObjectId | ref → Product, required, indexed   |
| userId     | ObjectId | ref → User, required               |
| userName   | String   | required                           |
| userAvatar | String   | optional                           |
| rating     | Number   | required, 1–5                      |
| comment    | String   | required                           |
| images     | String[] | optional                           |
| timestamps | createdAt |                                   |

**Index:** unique compound on (productId, userId) — one review per user per product

---

### Conversation — `models/Conversation.ts`

| Field        | Type            | Notes                              |
| ------------ | --------------- | ---------------------------------- |
| participants | Participant[]   | embedded array                     |
| lastMessage  | Object          | content, senderId, createdAt       |
| timestamps   | updatedAt       |                                    |

**Participant subdocument:** userId (ObjectId), name, role (buyer/seller/admin)

**Index:** on participants.userId

---

### ChatMessage — `models/ChatMessage.ts`

| Field          | Type     | Notes                              |
| -------------- | -------- | ---------------------------------- |
| conversationId | ObjectId | ref → Conversation, required, indexed |
| senderId       | ObjectId | required                           |
| senderName     | String   | required                           |
| senderAvatar   | String   | optional                           |
| content        | String   | required                           |
| type           | String   | enum: text, image                  |
| imageUrl       | String   | optional                           |
| seen           | Boolean  | default: false                     |
| seenAt         | Date     | optional                           |
| timestamps     | createdAt |                                   |

---

### SearchLog — `models/SearchLog.ts`

| Field       | Type     | Notes                  |
| ----------- | -------- | ---------------------- |
| query       | String   | required, indexed      |
| userId      | ObjectId | optional, ref → User   |
| resultCount | Number   | default: 0             |
| timestamps  | createdAt |                       |

---

### ProductView — `models/ProductView.ts`

| Field        | Type     | Notes                              |
| ------------ | -------- | ---------------------------------- |
| userId       | ObjectId | ref → User, required               |
| productId    | ObjectId | ref → Product, required            |
| category     | String   | required                           |
| viewCount    | Number   | default: 1                         |
| lastViewedAt | Date     | default: now                       |
| timestamps   | createdAt |                                   |

**Index:** unique compound on (userId, productId)

---

### Notification — `models/Notification.ts`

| Field   | Type     | Notes                                    |
| ------- | -------- | ---------------------------------------- |
| userId  | ObjectId | required, indexed                        |
| type    | String   | enum: order, promo, system, chat         |
| title   | String   | required                                 |
| message | String   | required                                 |
| read    | Boolean  | default: false                           |
| timestamps | createdAt |                                       |

---

## Middleware

| File                        | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `auth.middleware.ts`        | Extract Bearer token, verify JWT, attach `req.user`  |
| `role.middleware.ts`        | Factory: `authorize('seller')` — restricts by role   |
| `validate.middleware.ts`    | Validates `req.body` against a Zod schema            |
| `upload.middleware.ts`      | Multer memory storage — images (5MB, max 10) & files (10MB) |
| `rateLimiter.middleware.ts` | Auth: 5/min, Search: 30/min, General: 100/min        |

---

## API Routes & Controllers

### Auth — `auth.routes.ts` → `auth.controller.ts`

| Method | Path                     | Auth | Controller Method  | Description                         |
| ------ | ------------------------ | ---- | ------------------ | ----------------------------------- |
| POST   | `/api/auth/register/buyer`  | No   | `registerBuyer`    | Create buyer account                |
| POST   | `/api/auth/register/seller` | No   | `registerSeller`   | Create seller account               |
| POST   | `/api/auth/login/buyer`     | No   | `loginBuyer`       | Buyer login → tokens                |
| POST   | `/api/auth/login/seller`    | No   | `loginSeller`      | Seller login → tokens               |
| POST   | `/api/auth/login/admin`     | No   | `loginAdmin`       | Admin login → tokens                |
| POST   | `/api/auth/refresh`         | No   | `refreshToken`     | Refresh token → new access token    |
| POST   | `/api/auth/logout`          | Yes  | `logout`           | Clear refresh token cookie          |

**Notes:**
- Hash passwords with bcryptjs (12 rounds)
- Access token (15m) in response body, refresh token (7d) in httpOnly cookie
- Check user.status !== 'blocked' on login
- Never return passwordHash in any response

---

### Products (Public) — `product.routes.ts` → `product.controller.ts`

| Method | Path                                | Auth | Controller Method  | Description                           |
| ------ | ----------------------------------- | ---- | ------------------ | ------------------------------------- |
| GET    | `/api/products`                     | No   | `listProducts`     | Paginated listing with filters & sort |
| GET    | `/api/products/:id`                 | No   | `getProduct`       | Product detail + reviews              |
| GET    | `/api/products/search`              | No   | `searchProducts`   | Full-text search                      |
| GET    | `/api/products/search/autocomplete` | No   | `autocomplete`     | Fuzzy suggestions                     |
| GET    | `/api/products/categories`          | No   | `getCategories`    | Categories with product counts        |

**Query params for listing:** category, minPrice, maxPrice, rating, sort (newest/price_asc/price_desc/popular/rating/deals), page, limit
**Only returns products where isApproved === true**

---

### Buyer — `buyer.routes.ts` → `buyer.controller.ts`

| Method | Path                                   | Auth | Role  | Controller Method    | Description               |
| ------ | -------------------------------------- | ---- | ----- | -------------------- | ------------------------- |
| GET    | `/api/buyer/profile`                   | Yes  | buyer | `getProfile`         | Get buyer profile         |
| PUT    | `/api/buyer/profile`                   | Yes  | buyer | `updateProfile`      | Update name, phone, avatar, addresses |
| GET    | `/api/buyer/wishlist`                  | Yes  | buyer | `getWishlist`        | Get wishlist products     |
| POST   | `/api/buyer/wishlist/:productId`       | Yes  | buyer | `addToWishlist`      | Add to wishlist           |
| DELETE | `/api/buyer/wishlist/:productId`       | Yes  | buyer | `removeFromWishlist` | Remove from wishlist      |
| GET    | `/api/buyer/orders`                    | Yes  | buyer | `getOrders`          | List buyer orders         |
| GET    | `/api/buyer/orders/:orderId`           | Yes  | buyer | `getOrderDetail`     | Single order detail       |
| POST   | `/api/buyer/orders/:orderId/return`    | Yes  | buyer | `requestReturn`      | Submit return request     |

---

### Cart — `cart.routes.ts` → `cart.controller.ts`

| Method | Path                            | Auth | Role  | Controller Method | Description                    |
| ------ | ------------------------------- | ---- | ----- | ----------------- | ------------------------------ |
| GET    | `/api/cart`                     | Yes  | buyer | `getCart`         | Get cart with calculated totals |
| POST   | `/api/cart/items`               | Yes  | buyer | `addItem`         | Add item (productId, qty, variants) |
| PUT    | `/api/cart/items/:productId`    | Yes  | buyer | `updateQuantity`  | Update item quantity           |
| DELETE | `/api/cart/items/:productId`    | Yes  | buyer | `removeItem`      | Remove item from cart          |
| POST   | `/api/cart/apply-coupon`        | Yes  | buyer | `applyCoupon`     | Validate & apply coupon code   |
| DELETE | `/api/cart/coupon`              | Yes  | buyer | `removeCoupon`    | Remove applied coupon          |

**Totals calculated server-side:** subtotal, shipping ($5.99), tax (8%), couponDiscount, total

---

### Orders — `order.routes.ts` → `order.controller.ts`

| Method | Path           | Auth | Role  | Controller Method | Description          |
| ------ | -------------- | ---- | ----- | ----------------- | -------------------- |
| POST   | `/api/orders`  | Yes  | buyer | `createOrder`     | Place order from cart |

**Logic:**
- Validate stock, recalculate totals server-side
- Generate orderNumber (NXM-XXXXX)
- Group items by sellerId → one Order per seller
- Deduct stock, clear cart, notify seller

---

### Payment — `payment.routes.ts` → `payment.controller.ts`

| Method | Path                            | Auth | Role  | Controller Method  | Description                  |
| ------ | ------------------------------- | ---- | ----- | ------------------ | ---------------------------- |
| POST   | `/api/payment/initiate`         | Yes  | buyer | `initiatePayment`  | Create Stripe PaymentIntent  |
| POST   | `/api/payment/confirm`          | Yes  | buyer | `confirmPayment`   | Confirm payment, update order |
| GET    | `/api/payment/status/:orderId`  | Yes  | buyer | `getPaymentStatus` | Check payment status         |
| POST   | `/api/payment/webhook`          | No   | —     | `handleWebhook`    | Stripe webhook handler       |

**Notes:** Sandbox/test mode only. Platform fee calculated (e.g. 10%). Creates Transaction record.

---

### Seller — `seller.routes.ts` → `seller.controller.ts`

| Method | Path                                    | Auth | Role   | Controller Method      | Description                      |
| ------ | --------------------------------------- | ---- | ------ | ---------------------- | -------------------------------- |
| GET    | `/api/seller/dashboard`                 | Yes  | seller | `getDashboard`         | Summary stats: sales, orders, alerts |
| GET    | `/api/seller/products`                  | Yes  | seller | `getProducts`          | List seller's products           |
| POST   | `/api/seller/products`                  | Yes  | seller | `createProduct`        | Add product (isApproved: false)  |
| PUT    | `/api/seller/products/:id`              | Yes  | seller | `updateProduct`        | Edit product                     |
| DELETE | `/api/seller/products/:id`              | Yes  | seller | `deleteProduct`        | Remove product                   |
| POST   | `/api/seller/products/bulk-upload`      | Yes  | seller | `bulkUploadProducts`   | Excel/CSV import                 |
| GET    | `/api/seller/inventory`                 | Yes  | seller | `getInventory`         | Stock levels with status colors  |
| PUT    | `/api/seller/inventory/:productId`      | Yes  | seller | `updateStock`          | Update stock quantity            |
| POST   | `/api/seller/inventory/bulk-update`     | Yes  | seller | `bulkUpdateStock`      | CSV bulk stock update            |
| GET    | `/api/seller/orders`                    | Yes  | seller | `getOrders`            | Orders for this seller           |
| PUT    | `/api/seller/orders/:id/status`         | Yes  | seller | `updateOrderStatus`    | Advance status + tracking ID     |
| GET    | `/api/seller/analytics`                 | Yes  | seller | `getAnalytics`         | Sales data + category breakdown  |
| GET    | `/api/seller/coupons`                   | Yes  | seller | `getCoupons`           | List seller's coupons            |
| POST   | `/api/seller/coupons`                   | Yes  | seller | `createCoupon`         | Create coupon                    |
| PUT    | `/api/seller/coupons/:id`               | Yes  | seller | `updateCoupon`         | Edit coupon                      |
| DELETE | `/api/seller/coupons/:id`               | Yes  | seller | `deleteCoupon`         | Remove coupon                    |
| GET    | `/api/seller/settings`                  | Yes  | seller | `getSettings`          | Store profile settings           |
| PUT    | `/api/seller/settings`                  | Yes  | seller | `updateSettings`       | Update store info                |

**Dashboard response:** totalSales, totalOrders, pendingOrders, lowStockAlerts, thisMonthRevenue, thisMonthGrowth
**Order status pipeline:** pending → confirmed → packed → shipped → delivered (trackingId required for shipped)
**Analytics query:** ?period=weekly|monthly → returns sales data array + top categories

---

### Admin — `admin.routes.ts` → `admin.controller.ts`

| Method | Path                                  | Auth | Role  | Controller Method      | Description                    |
| ------ | ------------------------------------- | ---- | ----- | ---------------------- | ------------------------------ |
| GET    | `/api/admin/dashboard`                | Yes  | admin | `getDashboard`         | Platform-wide metrics          |
| GET    | `/api/admin/users`                    | Yes  | admin | `getUsers`             | List all users (buyers+sellers) |
| PUT    | `/api/admin/users/:id/block`          | Yes  | admin | `blockUser`            | Block user with reason         |
| PUT    | `/api/admin/users/:id/suspend`        | Yes  | admin | `suspendUser`          | Suspend user                   |
| PUT    | `/api/admin/users/:id/activate`       | Yes  | admin | `activateUser`         | Reactivate user                |
| GET    | `/api/admin/products`                 | Yes  | admin | `getProducts`          | All products                   |
| GET    | `/api/admin/products/pending`         | Yes  | admin | `getPendingProducts`   | Awaiting approval              |
| PUT    | `/api/admin/products/:id/approve`     | Yes  | admin | `approveProduct`       | Approve product                |
| PUT    | `/api/admin/products/:id/reject`      | Yes  | admin | `rejectProduct`        | Reject with reason             |
| GET    | `/api/admin/orders`                   | Yes  | admin | `getOrders`            | All orders platform-wide       |
| GET    | `/api/admin/transactions`             | Yes  | admin | `getTransactions`      | All transactions + fees        |
| GET    | `/api/admin/analytics`                | Yes  | admin | `getAnalytics`         | Revenue, trends, top sellers   |

**Dashboard response:** totalBuyers, totalSellers, totalOrders, totalRevenue, buyerGrowth, sellerGrowth, orderGrowth, revenueGrowth, monthlyData[]
**Users query:** ?search, ?role (buyer|seller), ?status (active|blocked|suspended), ?page
**Transactions response:** totalVolume, totalFees, transactions[]

---

### Chat — `chat.routes.ts` → `chat.controller.ts`

| Method | Path                                              | Auth | Controller Method    | Description                |
| ------ | ------------------------------------------------- | ---- | -------------------- | -------------------------- |
| GET    | `/api/chat/conversations`                         | Yes  | `getConversations`   | List user's conversations  |
| POST   | `/api/chat/conversations`                         | Yes  | `createConversation` | Start new conversation     |
| GET    | `/api/chat/conversations/:id/messages`            | Yes  | `getMessages`        | Message history (paginated) |
| POST   | `/api/chat/conversations/:id/messages`            | Yes  | `sendMessage`        | Send message + emit socket |
| PUT    | `/api/chat/conversations/:id/mark-seen`           | Yes  | `markAsSeen`         | Mark messages as read      |

---

### AI — `ai.routes.ts` → `ai.controller.ts`

| Method | Path                              | Auth     | Controller Method      | Description                     |
| ------ | --------------------------------- | -------- | ---------------------- | ------------------------------- |
| GET    | `/api/ai/recommendations`         | Optional | `getRecommendations`   | Personalized or related products |
| GET    | `/api/ai/search/autocomplete`     | No       | `getAutocomplete`      | NLP fuzzy search suggestions    |
| POST   | `/api/ai/pricing/suggest`         | Yes      | `getSuggestedPricing`  | Price range for a category      |
| POST   | `/api/ai/chatbot`                 | Yes      | `handleChatbot`        | Customer support bot            |

---

## Services

| File                          | Purpose                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| `recommendation.service.ts`   | Content-based (same category/tags), collaborative (view/purchase history), co-purchase matrix |
| `search.service.ts`           | Atlas Search fuzzy autocomplete, full-text search with filters, search logging |
| `pricing.service.ts`          | Category avg/min/max price aggregation, stock-based price adjustment tips  |
| `chatbot.service.ts`          | Keyword intent classifier (order_status, return, delivery, escalate, greeting), order lookup, optional LLM integration |
| `notification.service.ts`     | Create notification + push via Socket.IO to user's room                   |

---

## Socket.IO Events

### Client → Server

| Event                | Payload                                        | Description           |
| -------------------- | ---------------------------------------------- | --------------------- |
| `conversation:join`  | conversationId                                 | Join chat room        |
| `conversation:leave` | conversationId                                 | Leave chat room       |
| `message:send`       | { conversationId, content, type, imageUrl? }   | Send message          |
| `messages:seen`      | conversationId                                 | Mark messages read    |
| `typing:start`       | conversationId                                 | Typing indicator on   |
| `typing:stop`        | conversationId                                 | Typing indicator off  |

### Server → Client

| Event                 | Payload                                        | Description              |
| --------------------- | ---------------------------------------------- | ------------------------ |
| `message:receive`     | ChatMessage object                             | New message              |
| `conversation:update` | { conversationId, lastMessage, unreadCount }   | Conversation list update |
| `messages:seen`       | { conversationId, seenBy }                     | Read receipts            |
| `typing:start`        | { userId }                                     | Someone is typing        |
| `typing:stop`         | { userId }                                     | Stopped typing           |
| `user:online`         | { userId }                                     | User came online         |
| `user:offline`        | { userId }                                     | User went offline        |
| `notification`        | Notification object                            | Push notification        |

**Auth:** JWT verified on socket handshake via `socket.handshake.auth.token`
**Rooms:** Each user joins `user:{userId}` for notifications, `conversation:{id}` for chat

---

## Standard Response Format

**Success:** `{ "success": true, "data": {}, "message": "..." }`
**Error:** `{ "success": false, "message": "...", "errors": {} }`

| Code | Usage                          |
| ---- | ------------------------------ |
| 200  | Success (GET, PUT, DELETE)     |
| 201  | Created (POST)                 |
| 400  | Bad request                    |
| 401  | Missing/invalid auth           |
| 403  | Insufficient permissions       |
| 404  | Not found                      |
| 409  | Conflict (duplicate email)     |
| 422  | Validation error               |
| 429  | Rate limit exceeded            |
| 500  | Server error                   |

---

## Security Checklist

- Passwords hashed with bcryptjs (12 rounds)
- JWT secrets in .env only
- passwordHash excluded via select: false
- bankDetails excluded via select: false
- Role middleware on every protected route
- Zod validation on all POST/PUT bodies
- CORS restricted to CLIENT_URL
- Rate limiting: auth 5/min, search 30/min, general 100/min
- Refresh token in httpOnly, secure, sameSite: strict cookie
- Server-side total recalculation (never trust client)
- Stripe sandbox mode only
- File upload limits: 5MB images, 10MB documents
- Helmet.js security headers

---

> **Totals: 14 models, 50+ endpoints, 5 services, full Socket.IO layer**
