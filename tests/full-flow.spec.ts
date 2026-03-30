import { test, expect, type Page } from "@playwright/test";

// Unique test data per run
const TS = Date.now();
const SELLER = {
  storeName: "PlaywrightStore",
  ownerName: "Test Seller",
  email: `seller_${TS}@test.com`,
  phone: "1234567890",
  password: "TestPass123",
};

const BUYER = {
  fullName: "Test Buyer",
  email: `buyer_${TS}@test.com`,
  phone: "9876543210",
  password: "BuyerPass123",
};

async function clearAuth(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
}

// ─────────────────────────────────────────────
// SECTION 1: SELLER FLOWS
// ─────────────────────────────────────────────

test.describe("Seller Flows", () => {
  test.describe.configure({ mode: "serial" });
  let sellerPage: Page;

  test.beforeAll(async ({ browser }) => {
    sellerPage = await browser.newPage();
    await clearAuth(sellerPage);
  });

  test.afterAll(async () => {
    await sellerPage.close();
  });

  test("1.1 Seller Registration", async () => {
    await sellerPage.goto("/seller/register");
    await sellerPage.waitForLoadState("networkidle");

    // Identity section
    await sellerPage.locator('input[placeholder="THE CURATOR STUDIO"]').fill(SELLER.storeName);
    await sellerPage.locator('input[placeholder="JOHN DOE"]').fill(SELLER.ownerName);

    // Contact section
    await sellerPage.locator('input[placeholder="CONTACT@MARKIT.CO"]').fill(SELLER.email);
    await sellerPage.locator('input[placeholder="+1 555-0123"]').fill(SELLER.phone);

    // Password + confirm
    const pwInputs = sellerPage.locator('input[placeholder="••••••••••••"]');
    await pwInputs.nth(0).fill(SELLER.password);
    await pwInputs.nth(1).fill(SELLER.password);

    // Store description
    await sellerPage.locator('input[placeholder="Tell buyers about your store..."]').fill("A test store for Playwright");

    // Business address
    await sellerPage.locator('input[placeholder="123 BAUHAUS AVENUE"]').fill("123 Test St");
    await sellerPage.locator('input[placeholder="NEW YORK"]').fill("TestCity");
    await sellerPage.locator('input[placeholder="NY"]').fill("TS");
    await sellerPage.locator('input[placeholder="10001"]').fill("12345");
    await sellerPage.locator('input[placeholder="UNITED STATES"]').fill("TestCountry");

    // Bank details
    await sellerPage.locator('input[placeholder="FIRST NATIONAL BANK"]').fill("Test Bank");
    // Bank account + routing use same placeholder "••••••••••••" as passwords — they're nth(2) and nth(3)
    await pwInputs.nth(2).fill("9876543210");
    await pwInputs.nth(3).fill("021000021");

    // Select category
    await sellerPage.locator("button:has-text('Digital')").click();

    // Submit
    await sellerPage.locator("button[type='submit']").click();

    // Should redirect to seller login
    await sellerPage.waitForURL(/seller\/login/, { timeout: 15000 });
  });

  test("1.2 Seller Login", async () => {
    await sellerPage.goto("/seller/login");
    await sellerPage.locator("#email").fill(SELLER.email);
    await sellerPage.locator("#password").fill(SELLER.password);
    await sellerPage.locator("button[type='submit']").click();

    await sellerPage.waitForURL(/seller\/dashboard/, { timeout: 15000 });
  });

  test("1.3 Seller Dashboard loads", async () => {
    await expect(sellerPage.locator("body")).toContainText(/Revenue|Orders|Sales|Dashboard/i);
  });

  test("1.4 Add Product", async () => {
    await sellerPage.goto("/seller/products/new");
    await sellerPage.waitForLoadState("networkidle");

    await sellerPage.locator('input[placeholder*="Minimalist"]').fill("Test Headphones Pro");
    await sellerPage.locator("textarea").fill("Premium wireless headphones with noise cancellation");
    await sellerPage.locator("select").first().selectOption("electronics");

    const priceInput = sellerPage.locator('input[type="number"]').first();
    await priceInput.fill("149.99");

    const stockInput = sellerPage.locator('input[placeholder="0"]');
    await stockInput.fill("50");

    await sellerPage.locator("button[type='submit']").click();
    await sellerPage.waitForTimeout(3000);
  });

  test("1.5 Products page loads", async () => {
    await sellerPage.goto("/seller/products");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Products|Catalog/i);
  });

  test("1.6 Inventory page loads", async () => {
    await sellerPage.goto("/seller/inventory");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Inventory|SKU/i);
  });

  test("1.7 Promotions page loads", async () => {
    await sellerPage.goto("/seller/promotions");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Promotions|Coupon/i);
  });

  test("1.8 Analytics page loads", async () => {
    await sellerPage.goto("/seller/analytics");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Analytics|Revenue/i);
  });

  test("1.9 Orders page loads", async () => {
    await sellerPage.goto("/seller/orders");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Orders/i);
  });

  test("1.10 Chat page loads", async () => {
    await sellerPage.goto("/seller/chat");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Messages|conversation/i);
  });

  test("1.11 Settings page loads", async () => {
    await sellerPage.goto("/seller/settings");
    await sellerPage.waitForLoadState("networkidle");
    await expect(sellerPage.locator("body")).toContainText(/Settings|Profile|Store/i);
  });
});

// ─────────────────────────────────────────────
// SECTION 2: BUYER FLOWS
// ─────────────────────────────────────────────

test.describe("Buyer Flows", () => {
  test.describe.configure({ mode: "serial" });
  let buyerPage: Page;

  test.beforeAll(async ({ browser }) => {
    buyerPage = await browser.newPage();
    await clearAuth(buyerPage);
  });

  test.afterAll(async () => {
    await buyerPage.close();
  });

  test("2.1 Buyer Registration", async () => {
    await buyerPage.goto("/register");

    await buyerPage.locator('input[placeholder="John Doe"]').fill(BUYER.fullName);
    await buyerPage.locator('input[placeholder="name@example.com"]').fill(BUYER.email);
    await buyerPage.locator('input[placeholder="+1 555 0123"]').fill(BUYER.phone);

    const pwInputs = buyerPage.locator('input[type="password"]');
    await pwInputs.first().fill(BUYER.password);
    await pwInputs.nth(1).fill(BUYER.password);

    await buyerPage.locator('input[type="checkbox"]').check();
    await buyerPage.locator("button[type='submit']").click();

    await buyerPage.waitForURL(/login/, { timeout: 15000 });
  });

  test("2.2 Buyer Login", async () => {
    await buyerPage.goto("/login");

    // Email field is type="text" not type="email"
    await buyerPage.locator('input[placeholder="name@example.com"]').fill(BUYER.email);
    await buyerPage.locator('input[type="password"]').fill(BUYER.password);
    await buyerPage.locator("button[type='submit']").click();

    await buyerPage.waitForURL(/dashboard/, { timeout: 15000 });
  });

  test("2.3 Home page loads with all sections", async () => {
    await buyerPage.goto("/");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("h1")).toContainText(/Every|Thing|Need/);
    await expect(buyerPage.locator('input[placeholder*="Search"]').first()).toBeVisible();
  });

  test("2.4 AI Search bar works", async () => {
    const searchInput = buyerPage.locator('input[placeholder*="Search"]').first();
    await searchInput.click();
    await buyerPage.waitForTimeout(500);
    await searchInput.fill("head");
    await buyerPage.waitForTimeout(500);
  });

  test("2.5 Products listing", async () => {
    await buyerPage.goto("/products");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("body")).toContainText(/Products|Collection|Catalog/i);
  });

  test("2.6 Wishlist page", async () => {
    await buyerPage.goto("/wishlist");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("body")).toContainText(/Saved|Wishlist|curation/i);
  });

  test("2.7 Cart page", async () => {
    await buyerPage.goto("/cart");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("body")).toContainText(/Cart|empty|items/i);
  });

  test("2.8 Checkout page", async () => {
    await buyerPage.goto("/checkout");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("body")).toContainText(/Checkout|Shipping/i);
  });

  test("2.9 Payment page with 3 methods", async () => {
    await buyerPage.goto("/payment");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("text=Credit / Debit Card")).toBeVisible();
    await expect(buyerPage.locator("text=Bank Transfer")).toBeVisible();
    await expect(buyerPage.locator("text=Mobile Payment")).toBeVisible();
  });

  test("2.10 Buyer Dashboard", async () => {
    await buyerPage.goto("/dashboard");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("body")).toContainText(/Welcome|Orders/i);
  });

  test("2.11 Chat page", async () => {
    await buyerPage.goto("/chat");
    await buyerPage.waitForLoadState("networkidle");
    await expect(buyerPage.locator("body")).toContainText(/Messages|Concierge/i);
  });
});

// ─────────────────────────────────────────────
// SECTION 3: ADMIN PAGE RENDERS
// ─────────────────────────────────────────────

test.describe("Admin Flows", () => {
  test("3.1 Admin Login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText(/Admin/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  // Admin pages redirect to login without auth - just verify they don't crash
  const adminPages = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Products", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Transactions", path: "/admin/transactions" },
    { name: "Analytics", path: "/admin/analytics" },
  ];

  for (const p of adminPages) {
    test(`3.x Admin ${p.name} doesn't crash`, async ({ page }) => {
      const response = await page.goto(p.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).not.toBe(500);
      await page.waitForTimeout(1000);
    });
  }
});

// ─────────────────────────────────────────────
// SECTION 4: ALL PAGES RENDER WITHOUT 500/JS ERROR
// ─────────────────────────────────────────────

test.describe("All Pages Render Without Crash", () => {
  const pages = [
    { name: "Home", path: "/" },
    { name: "Buyer Login", path: "/login" },
    { name: "Buyer Register", path: "/register" },
    { name: "Products", path: "/products" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Cart", path: "/cart" },
    { name: "Checkout", path: "/checkout" },
    { name: "Payment", path: "/payment" },
    { name: "Order Confirmation", path: "/order-confirmation" },
    { name: "Buyer Dashboard", path: "/dashboard" },
    { name: "Buyer Chat", path: "/chat" },
    { name: "Seller Login", path: "/seller/login" },
    { name: "Seller Register", path: "/seller/register" },
    { name: "Seller Dashboard", path: "/seller/dashboard" },
    { name: "Seller Products", path: "/seller/products" },
    { name: "Seller Add Product", path: "/seller/products/new" },
    { name: "Seller Inventory", path: "/seller/inventory" },
    { name: "Seller Orders", path: "/seller/orders" },
    { name: "Seller Promotions", path: "/seller/promotions" },
    { name: "Seller Analytics", path: "/seller/analytics" },
    { name: "Seller Chat", path: "/seller/chat" },
    { name: "Seller Settings", path: "/seller/settings" },
    { name: "Admin Login", path: "/admin/login" },
    { name: "Admin Dashboard", path: "/admin/dashboard" },
    { name: "Admin Users", path: "/admin/users" },
    { name: "Admin Products", path: "/admin/products" },
    { name: "Admin Orders", path: "/admin/orders" },
    { name: "Admin Transactions", path: "/admin/transactions" },
    { name: "Admin Analytics", path: "/admin/analytics" },
  ];

  for (const p of pages) {
    test(`${p.name} (${p.path}) no 500 or JS error`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => {
        if (!err.message.includes("next/image") && !err.message.includes("next.config")) {
          errors.push(err.message);
        }
      });

      const response = await page.goto(p.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).not.toBe(500);
      await page.waitForTimeout(1000);
      expect(errors).toEqual([]);
    });
  }
});
