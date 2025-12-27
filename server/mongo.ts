import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// .env nằm cùng thư mục với file mongo.ts (trong /server)
dotenv.config({ path: fileURLToPath(new URL(".env", import.meta.url)) });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    "Missing MONGODB_URI. Create server/.env and set MONGODB_URI=..."
  );
}

const client = new MongoClient(uri);
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = client.connect();
  }
  return clientPromise;
}

export function getDbName(): string {
  return process.env.MONGODB_DB || "CodeMaster";
}

export function getUsersCollection(): string {
  return process.env.MONGODB_USERS_COLLECTION || "users";
}
