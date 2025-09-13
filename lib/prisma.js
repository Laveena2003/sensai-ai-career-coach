// lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Use a dedicated property on globalThis to cache PrismaClient
const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // optional: logs useful during dev
  });

// Prevent creating new instances on hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { db };
