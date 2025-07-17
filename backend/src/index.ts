import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { postgresConnection, connectMongoDB } from "./config/database";
import authRoutes from "./routes/auth";

config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize PostgreSQL connection
    await postgresConnection.initialize();
    console.log("PostgreSQL connected successfully");

    // Initialize MongoDB connection
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
