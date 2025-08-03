import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { postgresConnection, connectMongoDB } from "./config/database";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resume";
import analyzeRoutes from "./routes/analyze";
import companyRoutes from "./routes/company";
import applicationRoutes from "./routes/application";
import passport from "./passport";
import "./entities/Resume"; // Register Resume entity with TypeORM
import "./entities/Company"; // Register Company entity with TypeORM
import "./entities/Application"; // Register Application entity with TypeORM

config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);

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
