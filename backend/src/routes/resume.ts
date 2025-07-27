import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pdf from "pdf-parse";
import { Resume } from "../entities/Resume";
import { postgresConnection } from "../config/database";
import { authenticateToken } from "../middleware/auth";
import { User } from "../entities/User";
import { Request } from "express";

const router = express.Router();

// Extend Express Request type to include optional file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
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
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = [".pdf", ".docx", ".doc"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
    }
  },
});

// Helper function to extract text from PDF using improved parser
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Try to use the improved Python parser first
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', ['improved_resume_parser.py', 'extract_text', filePath]);
      
      let output = '';
      let error = '';
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        error += data.toString();
      });
      
      pythonProcess.on('close', (code: number) => {
        if (code === 0 && output.trim()) {
          resolve(output.trim());
        } else {
          // Fallback to original pdf-parse
          console.log("Falling back to pdf-parse due to:", error);
          const dataBuffer = fs.readFileSync(filePath);
          pdf(dataBuffer).then((data: any) => {
            resolve(data.text);
          }).catch((pdfError: any) => {
            console.error("Error extracting text from PDF:", pdfError);
            reject(new Error("Failed to extract text from PDF"));
          });
        }
      });
    });
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
  async (req: Request, res) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    try {
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = (req.user as User).id;
      const filePath = file.path;
      const fileExtension = path.extname(file.originalname).toLowerCase();

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
      await resumeRepository
        .createQueryBuilder()
        .update(Resume)
        .set({ isActive: false })
        .where("userId = :userId", { userId })
        .execute();

      const resume = resumeRepository.create({
        userId,
        fileName: file.originalname,
        originalText: extractedText,
        fileUrl: filePath,
        fileType: file.mimetype,
        fileSize: file.size,
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
    const userId = (req.user as User).id;
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
    const userId = (req.user as User).id;
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
    const userId = (req.user as User).id;
    const resumeId = req.params.id;

    const resumeRepository = postgresConnection.getRepository(Resume);

    // Set all resumes to inactive
    await resumeRepository
      .createQueryBuilder()
      .update(Resume)
      .set({ isActive: false })
      .where("userId = :userId", { userId })
      .execute();

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
    const userId = (req.user as User).id;
    const resumeId = req.params.id;
    const resumeRepository = postgresConnection.getRepository(Resume);

    // Set all resumes to inactive (if needed)
    await resumeRepository
      .createQueryBuilder()
      .update(Resume)
      .set({ isActive: false })
      .where("userId = :userId", { userId })
      .execute();

    // Delete the specified resume
    await resumeRepository.delete({ id: resumeId, userId });

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

export default router;
