import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import slugify from "slugify";
import { connectDB } from "../config/db";
import Category from "../models/Category";
import Product from "../models/Product";
import Review from "../models/Review";
import Order from "../models/Order";
import User from "../models/User";
import { categories, products } from "./data";

const sampleReviewers = ["Amara K.", "Devon P.", "Sana R.", "Liam T.", "Yuki M.", "Priya S."];
const sampleTexts = [
  "Exactly what I hoped for — the build quality is obvious the moment you pick it up.",
  "Took a few days to get used to, but now I reach for it over everything else.",
  "Shipping was fast and it arrived well packaged. Works as described.",
  "Good value for the price point. A couple of small quirks but nothing dealbreaking.",
  "This replaced two other products I owned. Genuinely well designed.",
];

async function run() {
  await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onyra");

  console.log("[seed] clearing existing collections...");
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log("[seed] creating demo users...");
  const [adminUser, customerUser] = await Promise.all([
    User.create({
      name: "Onyra Administrator",
      email: "admin@onyra.com",
      password: "admin123",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    }),
    User.create({
      name: "Sophia Bennett",
      email: "customer@onyra.com",
      password: "customer123",
      role: "customer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    }),
  ]);

  console.log("[seed] inserting categories...");
  await Category.insertMany(categories);

  console.log("[seed] inserting products...");
  const inserted = await Product.insertMany(
    products.map((p) => ({ ...p, slug: slugify(p.name, { lower: true, strict: true }) }))
  );

  console.log("[seed] inserting reviews...");
  const reviewDocs = inserted.flatMap((product) => {
    const count = 2 + Math.floor(Math.random() * 3);
    return Array.from({ length: count }).map(() => ({
      product: product._id,
      userName: sampleReviewers[Math.floor(Math.random() * sampleReviewers.length)],
      rating: 3 + Math.round(Math.random() * 2),
      text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
    }));
  });
  await Review.insertMany(reviewDocs);

  console.log("[seed] inserting sample orders...");
  if (inserted.length >= 2) {
    await Order.create({
      orderNumber: "ORD-2026-1088",
      user: customerUser._id,
      customer: {
        fullName: customerUser.name,
        email: customerUser.email,
        phone: "+1 (555) 234-5678",
      },
      shippingAddress: {
        address: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        postalCode: "97477",
        country: "United States",
      },
      deliveryMethod: "express",
      items: [
        {
          product: inserted[0]._id,
          name: inserted[0].name,
          image: inserted[0].image,
          price: inserted[0].price,
          quantity: 1,
        },
      ],
      subtotal: inserted[0].price,
      shipping: 16.99,
      tax: Math.round(inserted[0].price * 0.07 * 100) / 100,
      discount: 0,
      total: Math.round((inserted[0].price + 16.99 + inserted[0].price * 0.07) * 100) / 100,
      status: "delivered",
    });
  }

  console.log(
    `[seed] done — Users: Admin (${adminUser.email}), Customer (${customerUser.email}), Categories: ${categories.length}, Products: ${inserted.length}`
  );
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
