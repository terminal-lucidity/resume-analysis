import express from "express";
import fetch from "node-fetch";
import { getRepository } from "typeorm";
import { Resume } from "../entities/Resume";
import { auth } from "../middleware/auth";
import { User } from "../entities/User";
const router = express.Router();

// POST /api/analyze
// Requires: { jobTitle, jobDescription, resumeId }
/**
 * @param {import('express').Request & { user?: import('../entities/User').User }} req
 * @param {import('express').Response} res
 */
router.post("/", auth, async (req, res) => {
  try {
    const { jobTitle, jobDescription, jobLevel, resumeId } = req.body;
    if (!resumeId || !jobTitle || !jobLevel) {
      return res.status(400).json({
        error:
          "Missing required fields: resumeId, jobTitle, and jobLevel are required. jobDescription is optional.",
      });
    }

    // Null check for req.user
    const userId = (req.user as User)?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Fetch the resume text from the database
    const resumeRepo = getRepository(Resume);
    const resume = await resumeRepo.findOne({
      where: { id: resumeId, userId },
    });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found." });
    }

    // Use the correct property for resume text
    const resumeText = resume.originalText || "";
    const jobText = [jobTitle, jobDescription].filter(Boolean).join("\n");

    // 3. Call the Python hybrid analysis microservice
    const pyRes = await fetch("http://localhost:8001/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: resumeText,
        job: jobText,
        jobLevel: jobLevel,
      }),
    });
    if (!pyRes.ok) {
      return res.status(500).json({ error: "Hybrid analysis service error." });
    }
    const analysisResult = await pyRes.json();

    // 4. Store the detailed analysis in the database
    await resumeRepo.update(resumeId, {
      aiAnalysis: {
        strengths:
          analysisResult.detailed_analysis.llm_insights.strengths || [],
        improvements:
          analysisResult.detailed_analysis.llm_insights.weaknesses || [],
        suggestedRoles: [jobTitle], // Based on current analysis
        score: analysisResult.overall_score,
        summary:
          analysisResult.detailed_analysis.llm_insights.overall_assessment ||
          "Analysis completed",
      },
    });

    // 5. Return the comprehensive analysis
    return res.json({
      similarity: analysisResult.similarity,
      overallScore: analysisResult.overall_score,
      keywordMatchScore: analysisResult.keyword_match_score,
      skillGapAnalysis: analysisResult.skill_gap_analysis,
      improvementSuggestions: analysisResult.improvement_suggestions,
      detailedAnalysis: analysisResult.detailed_analysis,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
