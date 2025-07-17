import { DataSource } from "typeorm";
import mongoose from "mongoose";
import { config } from "dotenv";
import { User } from "../entities/User";
import "reflect-metadata";

config();

const requiredEnvVars = ["POSTGRES_URL", "MONGODB_URI"] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is not set`);
  }
}

// PostgreSQL connection using TypeORM
export const postgresConnection = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  synchronize: process.env.NODE_ENV === "development", // Don't use in production
  logging: process.env.NODE_ENV === "development",
  entities: [User],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

// MongoDB connection using Mongoose
export const connectMongoDB = async () => {
  try {
    // TypeScript now knows MONGODB_URI is defined due to the check above
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
