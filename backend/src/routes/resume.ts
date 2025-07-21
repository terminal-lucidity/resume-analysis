import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pdf from "pdf-parse";
import { Resume } from "../entities/Resume";
import { postgresConnection } from "../config/database";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".docx", ".doc"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Helper function to extract text from DOCX (basic implementation)
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    // For now, return a placeholder. In production, you'd use a proper DOCX parser
    // const docxParser = require('docx-parser');
    // const text = await docxParser.parse(filePath);
    return "DOCX parsing will be implemented with proper library";
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

// Upload and parse resume
router.post(
  "/upload",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = (req as any).user.userId;
      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      let extractedText = "";

      // Extract text based on file type
      if (fileExtension === ".pdf") {
        extractedText = await extractTextFromPDF(filePath);
      } else if (fileExtension === ".docx" || fileExtension === ".doc") {
        extractedText = await extractTextFromDOCX(filePath);
      }

      if (!extractedText.trim()) {
        return res
          .status(400)
          .json({ error: "Could not extract text from file" });
      }

      // Create resume record
      const resumeRepository = postgresConnection.getRepository(Resume);

      // Set all existing resumes to inactive
      await resumeRepository.update({ userId }, { isActive: false });

      const resume = resumeRepository.create({
        userId,
        fileName: req.file.originalname,
        originalText: extractedText,
        fileUrl: filePath,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        isActive: true,
        parsedData: null,
        aiAnalysis: null,
      });

      await resumeRepository.save(resume);

      res.json({
        message: "Resume uploaded successfully",
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          fileSize: resume.fileSize,
          createdAt: resume.createdAt,
        },
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ error: "Failed to upload resume" });
    }
  }
);

// Get user's resumes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const resumeRepository = postgresConnection.getRepository(Resume);

    const resumes = await resumeRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    res.json({
      resumes: resumes.map((resume) => ({
        id: resume.id,
        fileName: resume.fileName,
        isActive: resume.isActive,
        fileSize: resume.fileSize,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        hasAnalysis: !!resume.aiAnalysis,
      })),
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// Get specific resume with full data
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const resumeId = req.params.id;

    const resumeRepository = postgresConnection.getRepository(Resume);
    const resume = await resumeRepository.findOne({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({ resume });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// Set resume as active
router.patch("/:id/activate", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const resumeId = req.params.id;

    const resumeRepository = postgresConnection.getRepository(Resume);

    // Set all resumes to inactive
    await resumeRepository.update({ userId }, { isActive: false });

    // Set the specified resume as active
    await resumeRepository.update({ id: resumeId, userId }, { isActive: true });

    res.json({ message: "Resume activated successfully" });
  } catch (error) {
    console.error("Error activating resume:", error);
    res.status(500).json({ error: "Failed to activate resume" });
  }
});

// Delete resume
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const resumeId = req.params.id;

    const resumeRepository = postgresConnection.getRepository(Resume);
    const resume = await resumeRepository.findOne({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Delete the file if it exists
    if (resume.fileUrl && fs.existsSync(resume.fileUrl)) {
      fs.unlinkSync(resume.fileUrl);
    }

    await resumeRepository.remove(resume);

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

export default router;
