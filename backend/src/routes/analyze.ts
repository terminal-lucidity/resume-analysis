import express from "express";
import fetch from "node-fetch";
import { getRepository } from "typeorm";
import { Resume } from "../entities/Resume";
import authMiddleware from "../middleware/auth";

const router = express.Router();

// POST /api/analyze
// Requires: { jobTitle, jobDescription, resumeId }
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { jobTitle, jobDescription, resumeId } = req.body;
    if (!resumeId || (!jobTitle && !jobDescription)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 1. Fetch the resume text from the database
    const resumeRepo = getRepository(Resume);
    const resume = await resumeRepo.findOne({
      where: { id: resumeId, userId: req.user.id },
    });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found." });
    }

    // 2. Prepare the text for analysis
    const resumeText = resume.text || resume.content || "";
    const jobText = [jobTitle, jobDescription].filter(Boolean).join("\n");

    // 3. Call the Python embedding microservice
    const pyRes = await fetch("http://localhost:8001/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: resumeText, job: jobText }),
    });
    if (!pyRes.ok) {
      return res.status(500).json({ error: "Embedding service error." });
    }
    const { similarity } = await pyRes.json();

    // 4. Return the similarity score
    return res.json({ similarity });
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
