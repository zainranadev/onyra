import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onyra");
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[server] Onyra API listening on http://localhost:${PORT}`);
  });
}

main();
