/**
 * Seed an admin account into the database.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * This creates an admin with:
 *   Email: admin@markit.com
 *   Password: AdminPass123
 */

import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://tahashekh789_db_user:LwgwE4F7Gp0RaA6R@cluster0.iuimho9.mongodb.net/markit?retryWrites=true&w=majority";

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("No database connection");
    process.exit(1);
  }

  const adminsCollection = db.collection("admins");

  // Check if admin already exists
  const existing = await adminsCollection.findOne({ email: "admin@markit.com" });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword("AdminPass123");

  await adminsCollection.insertOne({
    email: "admin@markit.com",
    passwordHash,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin created successfully!");
  console.log("  Email:    admin@markit.com");
  console.log("  Password: AdminPass123");

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
