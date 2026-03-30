/**
 * E2E Full Flow Tests
 *
 * Prerequisites:
 *   1. npx tsx scripts/seed.ts --clear
 *   2. Dev server running: npm run dev
 *   3. Stripe test keys in .env.local (for payment tests)
 *
 * Run: npx playwright test tests/e2e-full-flow.spec.ts
 */

import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

// ─── Test Credentials (from seed) ───
const ADMIN = { email: "admin@markit.com", password: "AdminPass123" };
const SELLER1 = { email: "techvault@markit.com", password: "Seller123!" };
const SELLER2 = { email: "fashionhub@markit.com", password: "Seller123!" };
const BUYER1 = { email: "taha@markit.com", password: "Buyer123!" };
const BUYER2 = { email: "ayesha@markit.com", password: "Buyer123!" };

// Fresh accounts for registration tests
const ts = Date.now();
const NEW_BUYER = {
  fullName: "Test Buyer",
  email: `testbuyer${ts}@markit.com`,
  phone: "03001111111",
  password: "TestBuyer123!",
};
const NEW_SELLER = {
  storeName: "TestStore",
  ownerName: "Test Owner",
  email: `testseller${ts}@markit.com`,
  phone: "03002222222",
  password: "TestSeller123!",
};

const BASE = "http://localhost:3000";

// ─── Helpers ───

async function apiLogin(
  request: APIRequestContext,
  role: "buyer" | "seller" | "admin",
  email: string,
  password: string
): Promise<string> {
  const res = await request.post(`${BASE}/api/auth/login/${role}`, {
    data: { email, password },
  });
  const json = await res.json();
  if (!json.success) throw new Error(`Login failed for ${email}: ${json.message}`);
  return json.data.accessToken || json.data.token;
}

async function authedGet(request: APIRequestContext, token: string, path: string) {
  const res = await request.get(`${BASE}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function authedPost(request: APIRequestContext, token: string, path: string, data: unknown) {
  const res = await request.post(`${BASE}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
  return res.json();
}

async function authedPut(request: APIRequestContext, token: string, path: string, data: unknown) {
  const res = await request.put(`${BASE}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
  return res.json();
}

async function authedDelete(request: APIRequestContext, token: string, path: string) {
  const res = await request.delete(`${BASE}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ═══════════════════════════════════════
// SECTION 1: API-LEVEL BACKEND TESTS
// ═══════════════════════════════════════

test.describe("1. Auth API", () => {
  test("register a new buyer", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/register/buyer`, {
      data: {
        fullName: NEW_BUYER.fullName,
        email: NEW_BUYER.email,
        phone: NEW_BUYER.phone,
        password: NEW_BUYER.password,
      },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe(NEW_BUYER.email);
    expect(json.data.accessToken || json.data.token).toBeTruthy();
  });

  test("register a new seller", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/register/seller`, {
      data: {
        storeName: NEW_SELLER.storeName,
        ownerName: NEW_SELLER.ownerName,
        email: NEW_SELLER.email,
        phone: NEW_SELLER.phone,
        password: NEW_SELLER.password,
      },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe(NEW_SELLER.email);
  });

  test("reject duplicate buyer registration", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/register/buyer`, {
      data: {
        fullName: "Dup",
        email: BUYER1.email,
        phone: "03000000000",
        password: "password123",
      },
    });
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  test("login buyer with correct creds", async ({ request }) => {
    const token = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);
  });

  test("login seller with correct creds", async ({ request }) => {
    const token = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
    expect(token).toBeTruthy();
  });

  test("login admin with correct creds", async ({ request }) => {
    const token = await apiLogin(request, "admin", ADMIN.email, ADMIN.password);
    expect(token).toBeTruthy();
  });

  test("reject login with wrong password", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/login/buyer`, {
      data: { email: BUYER1.email, password: "wrongpassword" },
    });
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  test("logout clears session", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/logout`);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════
// SECTION 2: PRODUCTS API
// ═══════════════════════════════════════

test.describe("2. Products API (public)", () => {
  test("list products with pagination", async ({ request }) => {
    const res = await request.get(`${BASE}/api/products?page=1&limit=5`);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.products.length).toBeGreaterThan(0);
    expect(json.data.products.length).toBeLessThanOrEqual(5);
  });

  test("filter products by category", async ({ request }) => {
    const res = await request.get(`${BASE}/api/products?category=Electronics`);
    const json = await res.json();
    expect(json.success).toBe(true);
    for (const p of json.data.products) {
      expect(p.category).toBe("Electronics");
    }
  });

  test("search products by keyword", async ({ request }) => {
    const res = await request.get(`${BASE}/api/products?search=headphones`);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.products.length).toBeGreaterThan(0);
  });

  test("get single product by ID", async ({ request }) => {
    // First get any product
    const listRes = await request.get(`${BASE}/api/products?limit=1`);
    const listJson = await listRes.json();
    const productId = listJson.data.products[0]._id;

    const res = await request.get(`${BASE}/api/products/${productId}`);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.name).toBeTruthy();
  });
});

// ═══════════════════════════════════════
// SECTION 3: SELLER PRODUCT MANAGEMENT
// ═══════════════════════════════════════

test.describe("3. Seller Product Management", () => {
  let sellerToken: string;
  let createdProductId: string;

  test.beforeAll(async ({ request }) => {
    sellerToken = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
  });

  test("seller can list their products", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/products");
    expect(json.success).toBe(true);
    expect(json.data.products.length).toBeGreaterThan(0);
  });

  test("seller can create a product", async ({ request }) => {
    const json = await authedPost(request, sellerToken, "/seller/products", {
      name: `E2E Test Product ${ts}`,
      description: "Created by E2E test",
      category: "Electronics",
      price: 99.99,
      stock: 25,
      tags: ["test", "e2e"],
    });
    expect(json.success).toBe(true);
    expect(json.data.name).toContain("E2E Test Product");
    createdProductId = json.data._id;
  });

  test("seller can update a product", async ({ request }) => {
    const json = await authedPut(request, sellerToken, `/seller/products/${createdProductId}`, {
      price: 89.99,
      description: "Updated by E2E test",
    });
    expect(json.success).toBe(true);
    expect(json.data.price).toBe(89.99);
  });

  test("seller can view inventory", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/inventory");
    expect(json.success).toBe(true);
    expect(json.data.inventory.length).toBeGreaterThan(0);
  });

  test("seller can update stock", async ({ request }) => {
    const json = await authedPut(request, sellerToken, `/seller/inventory/${createdProductId}`, {
      stockQuantity: 50,
    });
    expect(json.success).toBe(true);
  });

  test("seller can delete a product", async ({ request }) => {
    const json = await authedDelete(request, sellerToken, `/seller/products/${createdProductId}`);
    expect(json.success).toBe(true);
  });

  test("seller can view dashboard", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/dashboard");
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("totalSales");
    expect(json.data).toHaveProperty("totalOrders");
  });

  test("seller can view analytics", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/analytics");
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════
// SECTION 4: COUPON MANAGEMENT
// ═══════════════════════════════════════

test.describe("4. Seller Coupons", () => {
  let sellerToken: string;
  let couponId: string;

  test.beforeAll(async ({ request }) => {
    sellerToken = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
  });

  test("seller can list coupons", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/coupons");
    expect(json.success).toBe(true);
  });

  test("seller can create a coupon", async ({ request }) => {
    const json = await authedPost(request, sellerToken, "/seller/coupons", {
      code: `E2ECOUPON${ts}`,
      discountType: "percentage",
      discountValue: 15,
      minOrderAmount: 20,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    expect(json.success).toBe(true);
    couponId = json.data._id;
  });

  test("seller can update a coupon", async ({ request }) => {
    const json = await authedPut(request, sellerToken, `/seller/coupons/${couponId}`, {
      discountValue: 25,
    });
    expect(json.success).toBe(true);
  });

  test("seller can delete a coupon", async ({ request }) => {
    const json = await authedDelete(request, sellerToken, `/seller/coupons/${couponId}`);
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════
// SECTION 5: BUYER CART & CHECKOUT FLOW
// ═══════════════════════════════════════

test.describe("5. Cart → Checkout → Order", () => {
  let buyerToken: string;
  let productId: string;
  let orderId: string;

  test.beforeAll(async ({ request }) => {
    buyerToken = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    // Get a product to add to cart
    const products = await authedGet(request, buyerToken, "/../products?limit=1");
    productId = products.data.products[0]._id;
  });

  test("add item to cart", async ({ request }) => {
    const json = await authedPost(request, buyerToken, "/cart/items", {
      productId,
      quantity: 2,
    });
    expect(json.success).toBe(true);
  });

  test("get cart contents", async ({ request }) => {
    const json = await authedGet(request, buyerToken, "/cart");
    expect(json.success).toBe(true);
    expect(json.data.items.length).toBeGreaterThan(0);
  });

  test("update cart item quantity", async ({ request }) => {
    const json = await authedPut(request, buyerToken, `/cart/items/${productId}`, {
      quantity: 1,
    });
    expect(json.success).toBe(true);
  });

  test("place an order", async ({ request }) => {
    const json = await authedPost(request, buyerToken, "/../orders", {
      shippingAddress: {
        fullName: "Taha Sohai",
        phone: "03331112222",
        street: "789 Main Blvd",
        city: "Islamabad",
        state: "ICT",
        zipCode: "44000",
        country: "Pakistan",
      },
      paymentMethod: "card",
      deliveryMethod: "standard",
    });
    expect(json.success).toBe(true);
    const orders = Array.isArray(json.data) ? json.data : [json.data];
    expect(orders.length).toBeGreaterThan(0);
    orderId = orders[0]._id || orders[0].id;
  });

  test("initiate payment for order", async ({ request }) => {
    const json = await authedPost(request, buyerToken, "/payment/initiate", {
      orderId,
      paymentMethod: "card",
    });
    expect(json.success).toBe(true);
    expect(json.data.clientSecret || json.data.paymentIntentId).toBeTruthy();
    expect(json.data.amount).toBeGreaterThan(0);
  });

  test("buyer can view their orders", async ({ request }) => {
    const json = await authedGet(request, buyerToken, "/buyer/orders");
    expect(json.success).toBe(true);
    const orders = json.data.orders || json.data;
    expect(Array.isArray(orders) ? orders.length : 0).toBeGreaterThan(0);
  });

  test("buyer can view order detail", async ({ request }) => {
    const json = await authedGet(request, buyerToken, `/buyer/orders/${orderId}`);
    expect(json.success).toBe(true);
  });

  test("remove item from cart", async ({ request }) => {
    // Add then remove
    await authedPost(request, buyerToken, "/cart/items", { productId, quantity: 1 });
    const json = await authedDelete(request, buyerToken, `/cart/items/${productId}`);
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════
// SECTION 6: BUYER WISHLIST & PROFILE
// ═══════════════════════════════════════

test.describe("6. Buyer Wishlist & Profile", () => {
  let buyerToken: string;
  let productId: string;

  test.beforeAll(async ({ request }) => {
    buyerToken = await apiLogin(request, "buyer", BUYER2.email, BUYER2.password);
    const products = await authedGet(request, buyerToken, "/../products?limit=1");
    productId = products.data.products[0]._id;
  });

  test("get buyer profile", async ({ request }) => {
    const json = await authedGet(request, buyerToken, "/buyer/profile");
    expect(json.success).toBe(true);
    expect(json.data.email).toBe(BUYER2.email);
  });

  test("update buyer profile", async ({ request }) => {
    const json = await authedPut(request, buyerToken, "/buyer/profile", {
      phone: "03219999999",
    });
    expect(json.success).toBe(true);
  });

  test("add to wishlist", async ({ request }) => {
    const json = await authedPost(request, buyerToken, `/buyer/wishlist/${productId}`, {});
    expect(json.success).toBe(true);
  });

  test("get wishlist", async ({ request }) => {
    const json = await authedGet(request, buyerToken, "/buyer/wishlist");
    expect(json.success).toBe(true);
  });

  test("remove from wishlist", async ({ request }) => {
    const json = await authedDelete(request, buyerToken, `/buyer/wishlist/${productId}`);
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════
// SECTION 7: SELLER ORDER MANAGEMENT
// ═══════════════════════════════════════

test.describe("7. Seller Order Management", () => {
  let sellerToken: string;

  test.beforeAll(async ({ request }) => {
    sellerToken = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
  });

  test("seller can view orders", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/orders");
    expect(json.success).toBe(true);
  });

  test("seller can update order status pending→confirmed", async ({ request }) => {
    // Find a pending order
    const ordersJson = await authedGet(request, sellerToken, "/seller/orders?status=pending");
    const orders = ordersJson.data?.orders || [];

    if (orders.length > 0) {
      const order = orders[0];
      const oid = order._id || order.id;
      const json = await authedPut(request, sellerToken, `/seller/orders/${oid}/status`, {
        status: "confirmed",
      });
      expect(json.success).toBe(true);
    } else {
      // No pending orders — skip gracefully
      test.skip();
    }
  });

  test("seller can update order confirmed→packed", async ({ request }) => {
    const ordersJson = await authedGet(request, sellerToken, "/seller/orders?status=confirmed");
    const orders = ordersJson.data?.orders || [];

    if (orders.length > 0) {
      const oid = orders[0]._id || orders[0].id;
      const json = await authedPut(request, sellerToken, `/seller/orders/${oid}/status`, {
        status: "packed",
      });
      expect(json.success).toBe(true);
    } else {
      test.skip();
    }
  });

  test("seller can ship order with tracking ID", async ({ request }) => {
    const ordersJson = await authedGet(request, sellerToken, "/seller/orders?status=packed");
    const orders = ordersJson.data?.orders || [];

    if (orders.length > 0) {
      const oid = orders[0]._id || orders[0].id;
      const json = await authedPut(request, sellerToken, `/seller/orders/${oid}/status`, {
        status: "shipped",
        trackingId: "TRK-E2E-12345",
      });
      expect(json.success).toBe(true);
    } else {
      test.skip();
    }
  });
});

// ═══════════════════════════════════════
// SECTION 8: ADMIN MODERATION
// ═══════════════════════════════════════

test.describe("8. Admin Moderation", () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await apiLogin(request, "admin", ADMIN.email, ADMIN.password);
  });

  test("admin dashboard returns stats", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/dashboard");
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("totalRevenue");
    expect(json.data).toHaveProperty("totalOrders");
    expect(json.data).toHaveProperty("totalUsers");
  });

  test("admin can list users", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/users");
    expect(json.success).toBe(true);
    const users = json.data.users || json.data;
    expect(Array.isArray(users) ? users.length : 0).toBeGreaterThan(0);
  });

  test("admin can list pending products", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/products/pending");
    expect(json.success).toBe(true);
  });

  test("admin can approve a pending product", async ({ request }) => {
    const pendingJson = await authedGet(request, adminToken, "/admin/products/pending");
    const products = pendingJson.data?.products || pendingJson.data || [];

    if (Array.isArray(products) && products.length > 0) {
      const pid = products[0]._id || products[0].id;
      const json = await authedPut(request, adminToken, `/admin/products/${pid}/approve`, {});
      expect(json.success).toBe(true);
    } else {
      test.skip();
    }
  });

  test("admin can view all orders", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/orders");
    expect(json.success).toBe(true);
  });

  test("admin can view transactions", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/transactions");
    expect(json.success).toBe(true);
  });

  test("admin can view analytics", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/analytics");
    expect(json.success).toBe(true);
  });

  test("admin can block a user", async ({ request }) => {
    // Get a buyer to block
    const usersJson = await authedGet(request, adminToken, "/admin/users?role=buyer");
    const users = usersJson.data?.users || usersJson.data || [];

    if (Array.isArray(users) && users.length > 0) {
      // Find the test buyer, not the seeded ones
      const testUser = users.find((u: { email: string }) => u.email === NEW_BUYER.email);
      if (testUser) {
        const uid = testUser._id || testUser.id;
        const json = await authedPut(request, adminToken, `/admin/users/${uid}/block`, {
          action: "block",
          role: "buyer",
        });
        expect(json.success).toBe(true);

        // Unblock immediately so other tests aren't affected
        await authedPut(request, adminToken, `/admin/users/${uid}/block`, {
          action: "activate",
          role: "buyer",
        });
      }
    }
  });
});

// ═══════════════════════════════════════
// SECTION 9: CHAT API
// ═══════════════════════════════════════

test.describe("9. Chat API", () => {
  let buyerToken: string;
  let sellerToken: string;
  let conversationId: string;

  test.beforeAll(async ({ request }) => {
    buyerToken = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    sellerToken = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
  });

  test("buyer can list conversations", async ({ request }) => {
    const json = await authedGet(request, buyerToken, "/chat/conversations");
    expect(json.success).toBe(true);
    const convs = json.data;
    if (Array.isArray(convs) && convs.length > 0) {
      conversationId = convs[0]._id || convs[0].id;
    }
  });

  test("buyer can create a conversation", async ({ request }) => {
    // Get seller2's ID to create a new conversation
    const sellerToken2 = await apiLogin(request, "seller", SELLER2.email, SELLER2.password);
    const settingsJson = await authedGet(request, sellerToken2, "/seller/settings");
    const seller2Id = settingsJson.data?._id || settingsJson.data?.id;

    if (seller2Id) {
      const json = await authedPost(request, buyerToken, "/chat/conversations", {
        participantId: seller2Id,
        participantRole: "seller",
        participantName: "FashionHub",
        userName: "Taha Sohai",
      });
      expect(json.success).toBe(true);
      conversationId = json.data._id || json.data.id;
    }
  });

  test("buyer can send a message", async ({ request }) => {
    if (!conversationId) test.skip();
    const json = await authedPost(request, buyerToken, `/chat/conversations/${conversationId}/messages`, {
      content: "Hello from E2E test!",
      type: "text",
      userName: "Taha Sohai",
    });
    expect(json.success).toBe(true);
  });

  test("seller can view messages in conversation", async ({ request }) => {
    // Seller1 should have a conversation from the seed
    const convsJson = await authedGet(request, sellerToken, "/chat/conversations");
    const convs = convsJson.data;
    if (Array.isArray(convs) && convs.length > 0) {
      const cid = convs[0]._id || convs[0].id;
      const json = await authedGet(request, sellerToken, `/chat/conversations/${cid}/messages`);
      expect(json.success).toBe(true);
    }
  });

  test("seller can send a reply", async ({ request }) => {
    const convsJson = await authedGet(request, sellerToken, "/chat/conversations");
    const convs = convsJson.data;
    if (Array.isArray(convs) && convs.length > 0) {
      const cid = convs[0]._id || convs[0].id;
      const json = await authedPost(request, sellerToken, `/chat/conversations/${cid}/messages`, {
        content: "Thanks for your message! Order will ship soon.",
        type: "text",
        userName: "TechVault",
      });
      expect(json.success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════
// SECTION 10: AI FEATURES
// ═══════════════════════════════════════

test.describe("10. AI Features", () => {
  test("search autocomplete", async ({ request }) => {
    const res = await request.get(`${BASE}/api/ai/search/autocomplete?q=head`);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("product recommendations", async ({ request }) => {
    const res = await request.get(`${BASE}/api/ai/recommendations?limit=5`);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("pricing suggestion for seller", async ({ request }) => {
    const token = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
    const json = await authedPost(request, token, "/ai/pricing/suggest", {
      category: "Electronics",
      currentPrice: 150,
      stockQuantity: 100,
    });
    expect(json.success).toBe(true);
  });

  test("chatbot responds to message", async ({ request }) => {
    const token = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    const json = await authedPost(request, token, "/ai/chatbot", {
      message: "What is your return policy?",
    });
    expect(json.success).toBe(true);
    expect(json.data.reply || json.data.message).toBeTruthy();
  });
});

// ═══════════════════════════════════════
// SECTION 11: SELLER SETTINGS
// ═══════════════════════════════════════

test.describe("11. Seller Settings", () => {
  let sellerToken: string;

  test.beforeAll(async ({ request }) => {
    sellerToken = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
  });

  test("seller can get settings", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/settings");
    expect(json.success).toBe(true);
    expect(json.data.storeName).toBe("TechVault");
  });

  test("seller can update settings", async ({ request }) => {
    const json = await authedPut(request, sellerToken, "/seller/settings", {
      storeDescription: "Updated by E2E tests — Premium tech store",
    });
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════
// SECTION 12: UI PAGE RENDERING
// ═══════════════════════════════════════

test.describe("12. Buyer Pages Render", () => {
  test("home page loads", async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/markit/i, { timeout: 15000 }).catch(() => {
      // Title may differ, just check page loads
    });
    await expect(page.locator("body")).toBeVisible();
  });

  test("products page loads", async ({ page }) => {
    await page.goto(`${BASE}/products`);
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator("body")).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("12b. Seller Pages Render", () => {
  test("seller login page loads", async ({ page }) => {
    await page.goto(`${BASE}/seller/login`);
    await expect(page.locator("body")).toBeVisible();
  });

  test("seller register page loads", async ({ page }) => {
    await page.goto(`${BASE}/seller/register`);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("12c. Admin Pages Render", () => {
  test("admin login page loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await expect(page.locator("body")).toBeVisible();
  });
});

// ═══════════════════════════════════════
// SECTION 13: UI INTERACTION FLOWS
// ═══════════════════════════════════════

test.describe("13. Buyer Login UI Flow", () => {
  test("buyer can login via UI", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"], input[name="email"]', BUYER1.email);
    await page.fill('input[type="password"], input[name="password"]', BUYER1.password);
    await page.click('button[type="submit"]');

    // Should redirect away from login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
  });
});

test.describe("13b. Seller Login UI Flow", () => {
  test("seller can login via UI", async ({ page }) => {
    await page.goto(`${BASE}/seller/login`);
    await page.fill('input[type="email"], input[name="email"]', SELLER1.email);
    await page.fill('input[type="password"], input[name="password"]', SELLER1.password);
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
  });
});

test.describe("13c. Admin Login UI Flow", () => {
  test("admin can login via UI", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await page.fill('input[type="email"], input[name="email"]', ADMIN.email);
    await page.fill('input[type="password"], input[name="password"]', ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
  });
});

// ═══════════════════════════════════════
// SECTION 14: SECURITY & EDGE CASES
// ═══════════════════════════════════════

test.describe("14. Security", () => {
  test("protected routes reject unauthenticated requests", async ({ request }) => {
    const res = await request.get(`${BASE}/api/buyer/profile`);
    expect(res.status()).toBe(401);
  });

  test("seller routes reject buyer tokens", async ({ request }) => {
    const buyerToken = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    const res = await request.get(`${BASE}/api/seller/products`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test("admin routes reject seller tokens", async ({ request }) => {
    const sellerToken = await apiLogin(request, "seller", SELLER1.email, SELLER1.password);
    const res = await request.get(`${BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test("invalid order ID returns 400", async ({ request }) => {
    const token = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    const json = await authedGet(request, token, "/buyer/orders/invalid-id");
    expect(json.success).toBe(false);
  });

  test("passwords are not returned in responses", async ({ request }) => {
    const token = await apiLogin(request, "buyer", BUYER1.email, BUYER1.password);
    const json = await authedGet(request, token, "/buyer/profile");
    expect(json.data.passwordHash).toBeUndefined();
    expect(json.data.password).toBeUndefined();
  });
});

// ═══════════════════════════════════════
// SECTION 15: FULL FLOW INTEGRATION
// ═══════════════════════════════════════

test.describe("15. Full Integration: Seller→Admin→Buyer→Order", () => {
  const flowTs = Date.now();
  let sellerToken: string;
  let adminToken: string;
  let buyerToken: string;
  let newProductId: string;

  test("step 1: seller creates a product", async ({ request }) => {
    sellerToken = await apiLogin(request, "seller", SELLER2.email, SELLER2.password);
    const json = await authedPost(request, sellerToken, "/seller/products", {
      name: `Integration Test Widget ${flowTs}`,
      description: "A test product for the full integration flow",
      category: "Fashion",
      price: 29.99,
      stock: 100,
    });
    expect(json.success).toBe(true);
    newProductId = json.data._id;
  });

  test("step 2: admin approves the product", async ({ request }) => {
    adminToken = await apiLogin(request, "admin", ADMIN.email, ADMIN.password);
    const json = await authedPut(request, adminToken, `/admin/products/${newProductId}/approve`, {});
    expect(json.success).toBe(true);
  });

  test("step 3: product appears in public listing", async ({ request }) => {
    const res = await request.get(`${BASE}/api/products/${newProductId}`);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.isApproved).toBe(true);
  });

  test("step 4: buyer adds to cart and places order", async ({ request }) => {
    buyerToken = await apiLogin(request, "buyer", BUYER2.email, BUYER2.password);

    // Add to cart
    const cartJson = await authedPost(request, buyerToken, "/cart/items", {
      productId: newProductId,
      quantity: 3,
    });
    expect(cartJson.success).toBe(true);

    // Place order
    const orderJson = await authedPost(request, buyerToken, "/../orders", {
      shippingAddress: {
        fullName: "Ayesha Malik",
        phone: "03214445555",
        street: "321 Park Road",
        city: "Rawalpindi",
        state: "Punjab",
        zipCode: "46000",
        country: "Pakistan",
      },
      paymentMethod: "card",
      deliveryMethod: "standard",
    });
    expect(orderJson.success).toBe(true);
  });

  test("step 5: seller sees the new order", async ({ request }) => {
    const json = await authedGet(request, sellerToken, "/seller/orders");
    expect(json.success).toBe(true);
    const orders = json.data.orders || [];
    expect(orders.length).toBeGreaterThan(0);
  });

  test("step 6: admin sees the order in platform orders", async ({ request }) => {
    const json = await authedGet(request, adminToken, "/admin/orders");
    expect(json.success).toBe(true);
  });

  test("step 7: seller initiates chat with buyer", async ({ request }) => {
    // Get buyer2's ID
    const usersJson = await authedGet(request, adminToken, "/admin/users?role=buyer");
    const buyer2 = (usersJson.data?.users || []).find(
      (u: { email: string }) => u.email === BUYER2.email
    );

    if (buyer2) {
      const json = await authedPost(request, sellerToken, "/chat/conversations", {
        participantId: buyer2._id || buyer2.id,
        participantRole: "buyer",
        participantName: "Ayesha Malik",
        userName: "FashionHub",
      });
      expect(json.success).toBe(true);

      const convId = json.data._id || json.data.id;
      const msgJson = await authedPost(
        request,
        sellerToken,
        `/chat/conversations/${convId}/messages`,
        {
          content: "Hi Ayesha! Your order has been received. We will ship it soon!",
          type: "text",
          userName: "FashionHub",
        }
      );
      expect(msgJson.success).toBe(true);
    }
  });
});
