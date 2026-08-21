import mongoose from "mongoose";

export async function connectDB(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log(`[db] connected -> ${mongoose.connection.name}`);
  } catch (err) {
    console.error("[db] connection failed", err);
    process.exit(1);
  }
}
