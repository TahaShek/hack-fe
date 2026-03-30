/**
 * Database Seed Script
 *
 * Populates the system with realistic test data:
 * - 1 Admin
 * - 2 Sellers with store profiles
 * - 2 Buyers
 * - 12 Products across categories
 * - 2 Coupons
 * - Sample orders & transactions
 *
 * Usage: npx tsx scripts/seed.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth";

// Models
import Admin from "../src/models/Admin";
import User from "../src/models/User";
import Seller from "../src/models/Seller";
import Product from "../src/models/Product";
import Order from "../src/models/Order";
import Cart from "../src/models/Cart";
import Coupon from "../src/models/Coupon";
import Transaction from "../src/models/Transaction";
import Counter from "../src/models/Counter";
import Conversation from "../src/models/Conversation";
import ChatMessage from "../src/models/ChatMessage";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected\n");

  // ─── CLEAR EXISTING DATA ───
  const clearFlag = process.argv.includes("--clear");
  if (clearFlag) {
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      Seller.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Coupon.deleteMany({}),
      Transaction.deleteMany({}),
      Counter.deleteMany({}),
      Conversation.deleteMany({}),
      ChatMessage.deleteMany({}),
    ]);
    console.log("✅ Cleared\n");
  }

  // ─── ADMIN ───
  console.log("👤 Creating admin...");
  const adminHash = await hashPassword("AdminPass123");
  const admin = await Admin.findOneAndUpdate(
    { email: "admin@markit.com" },
    { email: "admin@markit.com", passwordHash: adminHash, role: "admin" },
    { upsert: true, new: true }
  );
  console.log(`   admin@markit.com / AdminPass123  (${admin._id})\n`);

  // ─── SELLERS ───
  console.log("🏪 Creating sellers...");
  const sellerHash = await hashPassword("Seller123!");

  const seller1 = await Seller.findOneAndUpdate(
    { email: "techvault@markit.com" },
    {
      storeName: "TechVault",
      ownerName: "Ali Hassan",
      email: "techvault@markit.com",
      phone: "03001234567",
      passwordHash: sellerHash,
      role: "seller",
      status: "active",
      storeDescription: "Premium electronics and gadgets at unbeatable prices",
      businessAddress: {
        street: "123 Tech Lane",
        city: "Lahore",
        state: "Punjab",
        zip: "54000",
        country: "Pakistan",
      },
    },
    { upsert: true, new: true }
  );
  console.log(`   techvault@markit.com / Seller123!  (${seller1._id})`);

  const seller2 = await Seller.findOneAndUpdate(
    { email: "fashionhub@markit.com" },
    {
      storeName: "FashionHub",
      ownerName: "Sara Khan",
      email: "fashionhub@markit.com",
      phone: "03009876543",
      passwordHash: sellerHash,
      role: "seller",
      status: "active",
      storeDescription: "Trendy fashion for the modern lifestyle",
      businessAddress: {
        street: "456 Style Street",
        city: "Karachi",
        state: "Sindh",
        zip: "75000",
        country: "Pakistan",
      },
    },
    { upsert: true, new: true }
  );
  console.log(`   fashionhub@markit.com / Seller123!  (${seller2._id})\n`);

  // ─── BUYERS ───
  console.log("🛒 Creating buyers...");
  const buyerHash = await hashPassword("Buyer123!");

  const buyer1 = await User.findOneAndUpdate(
    { email: "taha@markit.com" },
    {
      fullName: "Taha Sohai",
      email: "taha@markit.com",
      phone: "03331112222",
      passwordHash: buyerHash,
      role: "buyer",
      status: "active",
      addresses: [
        {
          fullName: "Taha Sohai",
          phone: "03331112222",
          street: "789 Main Blvd",
          city: "Islamabad",
          state: "ICT",
          zipCode: "44000",
          country: "Pakistan",
        },
      ],
    },
    { upsert: true, new: true }
  );
  console.log(`   taha@markit.com / Buyer123!  (${buyer1._id})`);

  const buyer2 = await User.findOneAndUpdate(
    { email: "ayesha@markit.com" },
    {
      fullName: "Ayesha Malik",
      email: "ayesha@markit.com",
      phone: "03214445555",
      passwordHash: buyerHash,
      role: "buyer",
      status: "active",
      addresses: [
        {
          fullName: "Ayesha Malik",
          phone: "03214445555",
          street: "321 Park Road",
          city: "Rawalpindi",
          state: "Punjab",
          zipCode: "46000",
          country: "Pakistan",
        },
      ],
    },
    { upsert: true, new: true }
  );
  console.log(`   ayesha@markit.com / Buyer123!  (${buyer2._id})\n`);

  // ─── PRODUCTS ───
  console.log("📦 Creating products...");

  const techProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-canceling wireless headphones with 40-hour battery life, deep bass, and comfortable over-ear design.",
      category: "Electronics",
      subcategory: "Audio",
      price: 79.99,
      compareAtPrice: 129.99,
      stockQuantity: 150,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
      tags: ["headphones", "wireless", "bluetooth", "audio"],
    },
    {
      name: "Smart Watch Pro X",
      description: "Advanced smartwatch with heart rate monitor, GPS tracking, sleep analysis, and 7-day battery life.",
      category: "Electronics",
      subcategory: "Wearables",
      price: 199.99,
      compareAtPrice: 249.99,
      stockQuantity: 75,
      images: ["https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600"],
      tags: ["smartwatch", "fitness", "wearable", "gps"],
    },
    {
      name: "Mechanical Gaming Keyboard",
      description: "RGB backlit mechanical keyboard with Cherry MX switches, aluminum frame, and programmable keys.",
      category: "Electronics",
      subcategory: "Peripherals",
      price: 129.99,
      stockQuantity: 200,
      images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600"],
      tags: ["keyboard", "gaming", "mechanical", "rgb"],
    },
    {
      name: "USB-C Hub 8-in-1",
      description: "Multi-port USB-C hub with HDMI 4K, USB 3.0, SD card reader, ethernet, and PD charging.",
      category: "Electronics",
      subcategory: "Accessories",
      price: 49.99,
      compareAtPrice: 69.99,
      stockQuantity: 300,
      images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600"],
      tags: ["usb-c", "hub", "adapter", "macbook"],
    },
    {
      name: "Portable Bluetooth Speaker",
      description: "Waterproof portable speaker with 360-degree sound, 12-hour playtime, and built-in microphone.",
      category: "Electronics",
      subcategory: "Audio",
      price: 59.99,
      stockQuantity: 180,
      images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"],
      tags: ["speaker", "bluetooth", "portable", "waterproof"],
    },
    {
      name: "Laptop Stand Adjustable",
      description: "Ergonomic aluminum laptop stand with adjustable height and angle, fits 10-17 inch laptops.",
      category: "Electronics",
      subcategory: "Accessories",
      price: 39.99,
      stockQuantity: 5,
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"],
      tags: ["laptop", "stand", "ergonomic", "desk"],
    },
  ];

  const fashionProducts = [
    {
      name: "Classic Leather Jacket",
      description: "Genuine leather biker jacket with quilted lining, multiple pockets, and antique brass hardware.",
      category: "Fashion",
      subcategory: "Outerwear",
      price: 249.99,
      compareAtPrice: 349.99,
      stockQuantity: 40,
      images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"],
      tags: ["jacket", "leather", "fashion", "mens"],
    },
    {
      name: "Designer Crossbody Bag",
      description: "Elegant vegan leather crossbody bag with gold chain strap, multiple compartments, and magnetic closure.",
      category: "Fashion",
      subcategory: "Bags",
      price: 89.99,
      stockQuantity: 65,
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],
      tags: ["bag", "crossbody", "fashion", "womens"],
    },
    {
      name: "Premium Cotton T-Shirt Pack",
      description: "Set of 3 premium 100% cotton crew-neck t-shirts in black, white, and grey. Pre-shrunk and tagless.",
      category: "Fashion",
      subcategory: "Tops",
      price: 44.99,
      stockQuantity: 500,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"],
      tags: ["tshirt", "cotton", "basics", "pack"],
    },
    {
      name: "Running Sneakers Ultra",
      description: "Lightweight running shoes with responsive cushioning, breathable mesh upper, and non-slip rubber sole.",
      category: "Fashion",
      subcategory: "Footwear",
      price: 119.99,
      compareAtPrice: 159.99,
      stockQuantity: 90,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
      tags: ["shoes", "running", "sneakers", "sport"],
    },
    {
      name: "Aviator Sunglasses",
      description: "Polarized aviator sunglasses with UV400 protection, gold metal frame, and gradient lenses.",
      category: "Fashion",
      subcategory: "Accessories",
      price: 34.99,
      stockQuantity: 200,
      images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"],
      tags: ["sunglasses", "aviator", "accessories", "uv"],
    },
    {
      name: "Slim Fit Chinos",
      description: "Stretch cotton slim-fit chinos with flat front, side pockets, and wrinkle-resistant fabric.",
      category: "Fashion",
      subcategory: "Pants",
      price: 54.99,
      stockQuantity: 0,
      images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600"],
      tags: ["chinos", "pants", "slim", "mens"],
    },
  ];

  // Counter for SKU generation
  let skuCounter = 1000;

  const createdProducts = [];

  for (const p of techProducts) {
    skuCounter++;
    const product = await Product.findOneAndUpdate(
      { name: p.name, sellerId: seller1._id },
      {
        sellerId: seller1._id,
        sellerName: "TechVault",
        ...p,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        skuCode: `TV-${skuCounter}`,
        isApproved: true,
        status: "approved",
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        purchases: Math.floor(Math.random() * 200),
        views: Math.floor(Math.random() * 1000) + 100,
      },
      { upsert: true, new: true }
    );
    createdProducts.push(product);
    console.log(`   ✓ ${product.name} ($${product.price}) — SKU: ${product.skuCode}`);
  }

  for (const p of fashionProducts) {
    skuCounter++;
    const product = await Product.findOneAndUpdate(
      { name: p.name, sellerId: seller2._id },
      {
        sellerId: seller2._id,
        sellerName: "FashionHub",
        ...p,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        skuCode: `FH-${skuCounter}`,
        isApproved: true,
        status: "approved",
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        purchases: Math.floor(Math.random() * 200),
        views: Math.floor(Math.random() * 1000) + 100,
      },
      { upsert: true, new: true }
    );
    createdProducts.push(product);
    console.log(`   ✓ ${product.name} ($${product.price}) — SKU: ${product.skuCode}`);
  }

  // Add one pending product for admin approval testing
  const pendingProduct = await Product.findOneAndUpdate(
    { name: "New Gadget Prototype", sellerId: seller1._id },
    {
      sellerId: seller1._id,
      sellerName: "TechVault",
      name: "New Gadget Prototype",
      slug: "new-gadget-prototype",
      description: "A cutting-edge prototype gadget awaiting approval.",
      category: "Electronics",
      price: 299.99,
      skuCode: `TV-PENDING-${Date.now()}`,
      stockQuantity: 10,
      images: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600"],
      tags: ["prototype", "new"],
      isApproved: false,
      status: "pending",
    },
    { upsert: true, new: true }
  );
  console.log(`   ✓ ${pendingProduct.name} (PENDING APPROVAL)\n`);

  // ─── COUPONS ───
  console.log("🎟️  Creating coupons...");

  await Coupon.findOneAndUpdate(
    { code: "TECH20", sellerId: seller1._id },
    {
      sellerId: seller1._id,
      code: "TECH20",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 50,
      maxDiscount: 100,
      usageLimit: 100,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log("   ✓ TECH20 — 20% off (min $50, max $100 discount)");

  await Coupon.findOneAndUpdate(
    { code: "FASHION10", sellerId: seller2._id },
    {
      sellerId: seller2._id,
      code: "FASHION10",
      discountType: "fixed",
      discountValue: 10,
      minOrderAmount: 30,
      usageLimit: 50,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log("   ✓ FASHION10 — $10 off (min $30)\n");

  // ─── SAMPLE ORDER ───
  console.log("📋 Creating sample order...");

  const orderNumber = `NXM-${String(Date.now()).slice(-5)}`;
  const sampleProduct = createdProducts[0]; // Headphones

  const sampleOrder = await Order.findOneAndUpdate(
    { buyerId: buyer1._id, sellerId: seller1._id, orderNumber },
    {
      orderNumber,
      buyerId: buyer1._id,
      buyerName: "Taha Sohai",
      sellerId: seller1._id,
      sellerName: "TechVault",
      items: [
        {
          productId: sampleProduct._id,
          productName: sampleProduct.name,
          productImage: sampleProduct.images[0] || "",
          quantity: 2,
          price: sampleProduct.price,
        },
      ],
      shippingAddress: {
        fullName: "Taha Sohai",
        phone: "03331112222",
        street: "789 Main Blvd",
        city: "Islamabad",
        state: "ICT",
        zipCode: "44000",
        country: "Pakistan",
      },
      deliveryMethod: "standard",
      paymentMethod: "card",
      paymentStatus: "completed",
      orderStatus: "confirmed",
      subtotal: sampleProduct.price * 2,
      discount: 0,
      shipping: 5,
      tax: Math.round(sampleProduct.price * 2 * 0.05 * 100) / 100,
      totalAmount: Math.round((sampleProduct.price * 2 + 5 + sampleProduct.price * 2 * 0.05) * 100) / 100,
    },
    { upsert: true, new: true }
  );
  console.log(`   ✓ Order ${orderNumber} — $${sampleOrder.totalAmount} (${sampleOrder.orderStatus})\n`);

  // ─── SAMPLE TRANSACTION ───
  console.log("💳 Creating sample transaction...");
  await Transaction.findOneAndUpdate(
    { orderId: sampleOrder._id },
    {
      orderId: sampleOrder._id,
      buyerId: buyer1._id,
      sellerId: seller1._id,
      buyerName: "Taha Sohai",
      sellerName: "TechVault",
      amount: sampleOrder.totalAmount,
      platformFee: Math.round(sampleOrder.totalAmount * 0.05 * 100) / 100,
      sellerAmount: Math.round(sampleOrder.totalAmount * 0.95 * 100) / 100,
      status: "completed",
      paymentMethod: "card",
      paymentGatewayId: `pi_seed_${Date.now()}`,
    },
    { upsert: true, new: true }
  );
  console.log("   ✓ Transaction recorded\n");

  // ─── SAMPLE CONVERSATION ───
  console.log("💬 Creating sample conversation...");
  let conversation = await Conversation.findOne({
    "participants.userId": { $all: [buyer1._id, seller1._id] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [
        { userId: buyer1._id, name: "Taha Sohai", role: "buyer" },
        { userId: seller1._id, name: "TechVault", role: "seller" },
      ],
      lastMessage: {
        content: "Hi, when will my order ship?",
        senderId: buyer1._id,
        createdAt: new Date(),
      },
    });
  }

  const existingMsg = await ChatMessage.findOne({
    conversationId: conversation._id,
    content: "Hi, when will my order ship?",
  });
  if (!existingMsg) {
    await ChatMessage.create({
      conversationId: conversation._id,
      senderId: buyer1._id,
      senderName: "Taha Sohai",
      content: "Hi, when will my order ship?",
      type: "text",
      seen: false,
    });
  }
  console.log("   ✓ Conversation between Taha & TechVault\n");

  // ─── ORDER COUNTER ───
  await Counter.findOneAndUpdate(
    { name: "orderNumber" },
    { $setOnInsert: { seq: 5 } },
    { upsert: true }
  );

  // ─── WISHLIST ───
  console.log("❤️  Setting up wishlist...");
  await User.updateOne(
    { _id: buyer1._id },
    { $addToSet: { wishlist: { $each: [createdProducts[1]._id, createdProducts[6]._id] } } }
  );
  console.log("   ✓ Added 2 products to Taha's wishlist\n");

  // ─── SUMMARY ───
  console.log("═══════════════════════════════════════");
  console.log("🎉 Seed complete! Test accounts:");
  console.log("═══════════════════════════════════════");
  console.log("");
  console.log("  ADMIN");
  console.log("    admin@markit.com / AdminPass123");
  console.log("");
  console.log("  SELLERS");
  console.log("    techvault@markit.com / Seller123!");
  console.log("    fashionhub@markit.com / Seller123!");
  console.log("");
  console.log("  BUYERS");
  console.log("    taha@markit.com / Buyer123!");
  console.log("    ayesha@markit.com / Buyer123!");
  console.log("");
  console.log(`  PRODUCTS: ${createdProducts.length} approved + 1 pending`);
  console.log("  COUPONS: TECH20, FASHION10");
  console.log(`  ORDERS: 1 sample order (${orderNumber})`);
  console.log("  CHAT: 1 conversation");
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
