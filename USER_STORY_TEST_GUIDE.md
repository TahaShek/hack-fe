# MARKIT — Full App Test Guide (User Story)

> This guide walks through **every feature** of the app as 3 users: a Buyer, a Seller, and an Admin.
> Follow each step in order. Each step depends on the previous one.

---

## Prerequisites

```bash
npm run dev          # Start server on http://localhost:3000
```

Make sure your `.env.local` has a valid `MONGODB_URI`.

---

## PART 1 — SELLER (Creates the products)

### 1.1 Register a Seller Account
1. Go to **http://localhost:3000/seller/register**
2. Fill in:
   - Store Name: `TechVault`
   - Owner Name: `Sarah Chen`
   - Email: `sarah@techvault.com`
   - Phone: `1234567890`
   - Password: `TestPass123`
   - Confirm Password: `TestPass123`
   - Business Address: `123 Market St, San Francisco, CA, 94105, US`
   - Bank Details: `First National, 9876543210, 021000021`
   - Category: Select `Digital`
3. Click **Register Account**
4. Should redirect to `/seller/login`

### 1.2 Login as Seller
1. Go to **http://localhost:3000/seller/login**
2. Email: `sarah@techvault.com` / Password: `TestPass123`
3. Click **Enter Studio**
4. Should redirect to **Seller Dashboard**

### 1.3 Check Seller Dashboard
- ✅ See metric cards (Total Revenue, Active Orders, etc.)
- ✅ See sales chart (weekly/monthly toggle)
- ✅ See recent orders table
- ✅ See low stock alerts

### 1.4 Add a Product
1. Click **Products** in sidebar
2. Click **Add Product**
3. Fill in:
   - Title: `Wireless Noise-Cancelling Headphones`
   - Description: `Premium wireless headphones with active noise cancellation`
   - Category: `Electronics`
   - Price: `149.99`
   - Compare at Price: `199.99`
   - Stock: `50`
4. Click **Add Image** (2-3 times to add placeholder images)
5. Add a variant: Name `Color`, add options `Black`, `White`, `Silver`
6. ✅ Check that **AI Dynamic Pricing** suggestion appears below price
7. Click **Create Product**
8. Should redirect to products list

### 1.5 Add a Second Product
1. Click **Add Product** again
2. Title: `Smart Fitness Watch Pro`
3. Description: `Track your health metrics with GPS and heart rate monitoring`
4. Category: `Electronics`
5. Price: `89.99`, Stock: `30`
6. Add images, create product

### 1.6 Bulk Upload via CSV
1. On the Add Product page, scroll to **Bulk Upload**
2. Create a file `products.csv` on your desktop:
   ```
   name,description,category,price,stock
   USB-C Hub,7-in-1 USB hub,Electronics,39.99,100
   Laptop Stand,Ergonomic aluminum stand,Electronics,59.99,75
   ```
3. Click **Choose File**, select the CSV
4. ✅ Preview table should show 2 rows
5. Click **Upload All**

### 1.7 Edit a Product
1. Go to **Products** in sidebar
2. Click the **edit icon** on any product
3. Change the price to `129.99`
4. ✅ See AI pricing suggestion update
5. Click **Save Changes**

### 1.8 Check Inventory
1. Click **Inventory** in sidebar
2. ✅ See stats bar (Total SKUs, Low Stock, Out of Stock, Active)
3. ✅ Color-coded stock levels (green >10, yellow ≤10, red 0)
4. Click **Update** on a product, enter new stock value
5. Try the **Bulk Update** button with a CSV:
   ```
   productId,newStock
   <paste-a-product-id>,25
   ```

### 1.9 Create a Coupon
1. Click **Promotions** in sidebar
2. Fill in the right-side form:
   - Code: `LAUNCH20`
   - Discount Value: `20`
   - Type: **Percentage**
3. Click **Generate Campaign**
4. ✅ Coupon appears in the active campaigns list
5. Click the **edit icon** on the coupon → modal opens pre-filled
6. Change value to `25`, click **Update Coupon**
7. Click the **trash icon** → coupon is deleted

### 1.10 Seller Settings
1. Click **Settings** in sidebar
2. ✅ See Store Profile, Business Address, Bank Details sections
3. Change Store Description to `Premium tech accessories`
4. Click **Save Changes**
5. Try **Change Password** section (enter current + new password)

### 1.11 Check Analytics
1. Click **Analytics** in sidebar
2. ✅ Revenue chart renders
3. ✅ Orders chart renders
4. ✅ Top products list shows
5. Toggle Weekly/Monthly

---

## PART 2 — BUYER (Browses and purchases)

### 2.1 Register a Buyer Account
1. Go to **http://localhost:3000/register**
2. Fill in:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Password: `BuyerPass123`
   - Confirm Password: `BuyerPass123`
3. Check the Terms checkbox
4. Click **Create Account**
5. Should redirect to `/login?registered=true`

### 2.2 Login as Buyer
1. Go to **http://localhost:3000/login**
2. Email: `john@example.com` / Password: `BuyerPass123`
3. Click **Sign In**
4. Should redirect to **Buyer Dashboard**

### 2.3 Browse Home Page
1. Go to **http://localhost:3000**
2. ✅ Hero section with **AI Search Bar** visible
3. ✅ Marquee ticker scrolling
4. ✅ Category grid
5. ✅ Featured products
6. ✅ **"Recommended for You"** section with AI badge
7. ✅ Editorial band

### 2.4 Test AI Search
1. Click the search bar in hero section
2. ✅ See **Recent** searches and **AI Suggestions** (trending)
3. Type `headph` (incomplete/typo)
4. ✅ Products should appear (fuzzy matching)
5. Click a product suggestion → goes to product detail

### 2.5 View Product Detail
1. Click any product
2. ✅ Image gallery with thumbnails
3. ✅ Price, rating, reviews
4. ✅ Variant selection (size, color)
5. ✅ **"Customers Also Bought"** section at bottom (AI-powered)
6. ✅ Reviews tab
7. ✅ Seller info tab

### 2.6 Add to Wishlist
1. On a product detail page, click the **Heart** icon
2. Click the **Heart** icon in the navbar
3. ✅ Wishlist page shows the saved product
4. ✅ Can remove item from wishlist

### 2.7 Add Products to Cart
1. Go back to a product, select a variant, set quantity to 2
2. Click **Add to Cart**
3. Repeat for a second product
4. Click the **Cart** icon in navbar
5. ✅ Cart shows both items with images, names, quantities
6. ✅ Can update quantity (+/-)
7. ✅ Can remove items
8. ✅ Order summary shows subtotal, shipping, tax

### 2.8 Apply Coupon
1. In the cart, enter coupon code `LAUNCH20` (if you created it as seller)
2. Click **Apply**
3. ✅ Discount appears in summary
4. ✅ Total updates

### 2.9 Checkout
1. Click **Proceed to Checkout**
2. Fill shipping address:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Street: `456 Oak Ave`
   - City: `New York`
   - State: `NY`
   - ZIP: `10001`
   - Country: `United States`
3. ✅ Order items preview on left
4. ✅ Summary with totals on right
5. Click **Continue to Payment**
6. ✅ Should redirect to `/payment?orderId=...`

### 2.10 Payment
1. ✅ See three payment methods: Card, Bank Transfer, Mobile
2. Select **Credit / Debit Card**
3. Fill in:
   - Name: `John Doe`
   - Card: `4242424242424242`
   - Expiry: `12/28`
   - CVC: `123`
4. ✅ Card preview updates live
5. Click **PAY NOW**
6. ✅ Loading spinner
7. ✅ Redirects to `/order-confirmation?orderId=...`

### 2.11 Order Confirmation
1. ✅ Order number displayed (NXM-XXXXX format)
2. ✅ Actual items you purchased listed
3. ✅ Total amount correct
4. ✅ Shipping address shown
5. ✅ "Track Order" button → goes to dashboard
6. ✅ "Continue Shopping" button → goes to products

### 2.12 Test Other Payment Methods
1. Add items to cart again, checkout
2. On payment page, select **Bank Transfer**
3. ✅ Bank form appears (Bank Name, Account Holder, Account Number, Routing)
4. Select **Mobile Payment**
5. ✅ Mobile form appears (Provider dropdown, Phone Number)

### 2.13 Buyer Dashboard
1. Go to **http://localhost:3000/dashboard**
2. ✅ **My Orders** tab — table with your placed orders
3. ✅ **Active Tracking** timeline shows status (should be "Confirmed" after payment)
4. ✅ Timeline is dynamic (not hardcoded)
5. Click **Notifications** tab
6. ✅ Notification list renders
7. ✅ Quick links: Wishlist, Messages, Browse Products

### 2.14 AI Chatbot
1. Click the **saffron sparkle button** (bottom-right corner, visible on all buyer pages)
2. ✅ Chat window opens
3. Click **"Track my order"** quick reply
4. ✅ Bot responds with order tracking info
5. Click **"Return policy"**
6. ✅ Bot explains return policy
7. Click **"Shipping info"**
8. ✅ Bot shows shipping options and prices
9. Type `Where is my order NXM-10001?`
10. ✅ Bot looks up the order
11. Click **"Talk to a human"**
12. ✅ Bot directs to human chat
13. ✅ Typing indicator (dots) while bot is "thinking"

### 2.15 Chat with Seller
1. Go to **http://localhost:3000/chat**
2. ✅ Conversation list on left
3. Select a conversation
4. ✅ Online/offline status indicator
5. Type a message, press Enter
6. ✅ Message appears in chat
7. Click the **image icon** → select an image file
8. ✅ Image appears in chat as message
9. ✅ "Live" indicator if socket is connected

---

## PART 3 — SELLER PROCESSES THE ORDER

### 3.1 Seller Sees New Order Notification
1. Login as seller at `/seller/login`
2. ✅ **Notification bell** in header may show new order notification
3. Click **Orders** in sidebar

### 3.2 Update Order Status
1. Find the buyer's order in the list
2. Click **Confirm** button
3. ✅ Status changes to "confirmed"
4. ✅ **Buyer gets a real-time notification** (if both logged in)
5. Click **Pack** button
6. ✅ Status changes to "packed"
7. Click **Ship** button → tracking ID modal appears
8. Enter tracking ID: `TRK-123456`
9. Click **Confirm Shipment**
10. ✅ Status changes to "shipped"

### 3.3 Verify Buyer Sees Update
1. Switch to buyer account (or open in another browser)
2. Go to **Buyer Dashboard**
3. ✅ Tracking timeline should now show **"Shipped"** step active
4. ✅ Notification bell may show "Order shipped" notification

### 3.4 Seller Chat
1. Go to **Seller Chat** in sidebar
2. ✅ Dark theme chat interface
3. ✅ Conversation list with online indicators
4. ✅ Can send text messages
5. ✅ Can send images via image button
6. ✅ Typing indicator dots when other user types

---

## PART 4 — ADMIN MODERATES

### 4.1 Login as Admin
1. Go to **http://localhost:3000/admin/login**
2. Email: use your admin email / Password: your admin password
3. ✅ Redirects to Admin Dashboard

> **Note:** You'll need to create an Admin account directly in MongoDB since there's no admin registration UI. Insert into the `admins` collection:
> ```js
> db.admins.insertOne({
>   email: "admin@markit.com",
>   passwordHash: "<bcrypt hash of your password>",
>   role: "admin"
> })
> ```
> Or use a script to hash: `bcryptjs.hashSync("AdminPass123", 12)`

### 4.2 Admin Dashboard
1. ✅ Metric cards: Total Buyers, Active Sellers, Open Orders, Gross Revenue
2. ✅ Revenue chart
3. ✅ Quick actions (Approve Pending Products, Review Flagged Users)
4. ✅ Live activity feed
5. ✅ Recent orders table

### 4.3 User Management
1. Click **Users** in sidebar
2. ✅ User table with search and role filters
3. Click **Edit** on a user → modal opens
4. Change the user's name, click **Save**
5. ✅ User updated in table
6. Click **Block** on a user
7. ✅ Status changes to "blocked"
8. Click **Unblock** to restore

### 4.4 Product Moderation
1. Click **Products** in sidebar
2. ✅ Stats cards: Pending Review, Approved, Rejected
3. ✅ Product table with status filters
4. Find a pending product
5. Click **Approve** ✅ or **Reject** ❌
6. ✅ Product status updates
7. ✅ **Seller gets notification** about approval/rejection

### 4.5 Order Management
1. Click **Orders** in sidebar
2. ✅ All platform orders with search and status filters
3. Click **Manage** on an order → modal opens
4. ✅ See order details: items, buyer, seller, address, status
5. Click **Cancel Order** or **Mark as Refunded**
6. ✅ Order status updates
7. ✅ **Buyer gets notification** about the change

### 4.6 Transactions
1. Click **Transactions** in sidebar
2. ✅ Summary cards: Total Volume, Platform Fees, Total Transactions
3. ✅ Transaction table with search
4. ✅ Status badges (completed, pending, refunded)

### 4.7 Analytics
1. Click **Analytics** in sidebar
2. ✅ Revenue trend chart
3. ✅ Top categories bar chart
4. ✅ User growth line chart (buyers vs sellers)
5. ✅ Order status distribution pie chart
6. ✅ Monthly orders bar chart

---

## PART 5 — BUYER REQUESTS RETURN

### 5.1 Request Return (after delivery)
1. Login as buyer
2. Go to **Dashboard**
3. If an order shows as "delivered" in tracking:
4. Click **Request Return**
5. ✅ Modal opens with textarea for reason
6. Enter: `Product arrived damaged, screen has scratches`
7. Click **Submit Return Request**
8. ✅ Success message shown
9. ✅ Order status updates

---

## PART 6 — REAL-TIME FEATURES

### 6.1 Test Push Notifications (Need 2 browsers)
1. **Browser A:** Login as Buyer
2. **Browser B:** Login as Seller
3. In Browser B (Seller): Go to Orders, update a status
4. ✅ Browser A (Buyer): Notification bell lights up with count
5. ✅ Click bell → see the notification in dropdown
6. ✅ Dashboard auto-refreshes order status

### 6.2 Test Live Chat (Need 2 browsers)
1. **Browser A:** Buyer at `/chat`
2. **Browser B:** Seller at `/seller/chat`
3. Browser A: Type a message
4. ✅ Browser B: Message appears in real-time
5. Browser B: Start typing
6. ✅ Browser A: See typing indicator (dots)
7. Browser A: Send an image
8. ✅ Browser B: Image appears

### 6.3 Online Status
1. ✅ When both are in chat, see green "Online" indicator
2. Close one browser tab
3. ✅ Other browser shows "Offline" for that user

---

## Checklist Summary

| Feature | Test Point |
|---------|-----------|
| Buyer Register | ✅ All fields + confirm password |
| Buyer Login | ✅ Redirect to dashboard |
| Seller Register | ✅ All fields + business address + bank |
| Seller Login | ✅ Redirect to dashboard |
| Admin Login | ✅ Redirect to dashboard |
| Home Page | ✅ Search bar + recommendations |
| Product Listing | ✅ Filters, sort, pagination |
| Product Detail | ✅ Variants, cart, wishlist, "Also Bought" |
| Wishlist | ✅ Add/remove, syncs to API |
| Cart | ✅ CRUD, coupon, totals |
| Checkout | ✅ Address form, creates order |
| Payment | ✅ Card/Bank/Mobile, API flow |
| Order Confirmation | ✅ Real order data |
| Buyer Dashboard | ✅ Orders, dynamic tracking, return |
| Seller Dashboard | ✅ Stats, charts, alerts |
| Product Management | ✅ Add/Edit/Delete, bulk upload |
| Inventory | ✅ Stock update, bulk update |
| Seller Orders | ✅ Status pipeline with tracking |
| Promotions | ✅ Create/Edit/Delete coupons |
| Seller Analytics | ✅ Charts render |
| Seller Settings | ✅ Profile, address, bank, password |
| Admin Dashboard | ✅ Metrics, charts, activity |
| User Management | ✅ Edit, block/unblock |
| Product Moderation | ✅ Approve/reject |
| Admin Orders | ✅ Manage, refund, cancel |
| Transactions | ✅ View list |
| Admin Analytics | ✅ All charts |
| AI Search | ✅ Fuzzy, autocomplete, suggestions |
| AI Recommendations | ✅ Home + product detail |
| AI Pricing | ✅ Seller product forms |
| AI Chatbot | ✅ Intent matching, quick replies |
| Real-time Chat | ✅ Messages, typing, images, online |
| Push Notifications | ✅ Order updates, bell icon |
| Sign Out | ✅ Navbar button works |
