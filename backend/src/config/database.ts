import { DataSource } from "typeorm";
import mongoose from "mongoose";
import { config } from "dotenv";
import { User } from "../entities/User";
import { Resume } from "../entities/Resume";
import { Company } from "../entities/Company";
import { Application } from "../entities/Application";
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
  entities: [User, Resume, Company, Application],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    // Handle connection timeouts
    connectionTimeoutMillis: 5000,
  },
});

// MongoDB connection using Mongoose
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      // Add Mongoose specific options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
