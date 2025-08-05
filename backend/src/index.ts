import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import { postgresConnection } from "./config/database";
import authRoutes from "./routes/auth";
import resumeRoutes from "./routes/resume";
import analyzeRoutes from "./routes/analyze";
import companyRoutes from "./routes/company";
import applicationRoutes from "./routes/application";
import jobRoutes from "./routes/jobs";
import { JobDataService } from "./services/jobDataService";

dotenv.config();

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
app.use("/api/jobs", jobRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize PostgreSQL connection
    await postgresConnection.initialize();
    console.log("✅ PostgreSQL connected successfully");

    // Initialize job data from free sources
    console.log("🔄 Initializing job data from free sources...");
    await JobDataService.initializeJobData();
    
    // Schedule regular job updates
    JobDataService.scheduleUpdates();
    console.log("✅ Job data service initialized");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Job search with real-time data ready!`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
