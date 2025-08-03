import express from "express";
import { Application, ApplicationStatus } from "../entities/Application";
import { Company } from "../entities/Company";
import { postgresConnection } from "../config/database";
import { authenticateToken } from "../middleware/auth";
import { User } from "../entities/User";

const router = express.Router();

// Get all applications for the user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const applicationRepository = postgresConnection.getRepository(Application);

    const applications = await applicationRepository.find({
      where: { userId },
      relations: ["company"],
      order: { createdAt: "DESC" },
    });

    res.json({
      applications: applications.map((application) => ({
        id: application.id,
        position: application.position,
        status: application.status,
        appliedDate: application.appliedDate,
        interviewDate: application.interviewDate,
        salary: application.salary,
        location: application.location,
        jobUrl: application.jobUrl,
        notes: application.notes,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        company: {
          id: application.company.id,
          name: application.company.name,
          website: application.company.website,
          industry: application.company.industry,
          location: application.company.location,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get specific application
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const applicationId = req.params.id;
    const applicationRepository = postgresConnection.getRepository(Application);

    const application = await applicationRepository.findOne({
      where: { id: applicationId, userId },
      relations: ["company"],
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ application });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// Create new application
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const {
      companyId,
      position,
      jobDescription,
      salary,
      location,
      jobUrl,
      status,
      appliedDate,
      notes,
      applicationDetails,
    } = req.body;

    if (!companyId || !position) {
      return res.status(400).json({
        error: "Company ID and position are required",
      });
    }

    const applicationRepository = postgresConnection.getRepository(Application);
    const companyRepository = postgresConnection.getRepository(Company);

    // Verify company exists
    const company = await companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const application = applicationRepository.create({
      userId,
      companyId,
      position: position.trim(),
      jobDescription,
      salary,
      location,
      jobUrl,
      status: status || ApplicationStatus.DRAFT,
      appliedDate: appliedDate ? new Date(appliedDate) : undefined,
      notes,
      applicationDetails,
    });

    await applicationRepository.save(application);

    // Fetch the created application with company details
    const createdApplication = await applicationRepository.findOne({
      where: { id: application.id },
      relations: ["company"],
    });

    res.status(201).json({
      message: "Application created successfully",
      application: createdApplication,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: "Failed to create application" });
  }
});

// Update application
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const applicationId = req.params.id;
    const {
      position,
      jobDescription,
      salary,
      location,
      jobUrl,
      status,
      appliedDate,
      interviewDate,
      notes,
      applicationDetails,
      interviewDetails,
    } = req.body;

    const applicationRepository = postgresConnection.getRepository(Application);

    const application = await applicationRepository.findOne({
      where: { id: applicationId, userId },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update application fields
    if (position !== undefined) application.position = position.trim();
    if (jobDescription !== undefined)
      application.jobDescription = jobDescription;
    if (salary !== undefined) application.salary = salary;
    if (location !== undefined) application.location = location;
    if (jobUrl !== undefined) application.jobUrl = jobUrl;
    if (status !== undefined) application.status = status;
    if (appliedDate !== undefined)
      application.appliedDate = appliedDate ? new Date(appliedDate) : undefined;
    if (interviewDate !== undefined)
      application.interviewDate = interviewDate
        ? new Date(interviewDate)
        : undefined;
    if (notes !== undefined) application.notes = notes;
    if (applicationDetails !== undefined)
      application.applicationDetails = applicationDetails;
    if (interviewDetails !== undefined)
      application.interviewDetails = interviewDetails;

    await applicationRepository.save(application);

    // Fetch the updated application with company details
    const updatedApplication = await applicationRepository.findOne({
      where: { id: application.id },
      relations: ["company"],
    });

    res.json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// Update application status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!status || !Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({
        error: "Valid status is required",
      });
    }

    const applicationRepository = postgresConnection.getRepository(Application);

    const application = await applicationRepository.findOne({
      where: { id: applicationId, userId },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = status;
    await applicationRepository.save(application);

    res.json({
      message: "Application status updated successfully",
      status: application.status,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

// Delete application
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const applicationId = req.params.id;
    const applicationRepository = postgresConnection.getRepository(Application);

    const application = await applicationRepository.findOne({
      where: { id: applicationId, userId },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    await applicationRepository.remove(application);

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

// Get applications by status
router.get("/status/:status", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as User).id;
    const status = req.params.status as ApplicationStatus;
    const applicationRepository = postgresConnection.getRepository(Application);

    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const applications = await applicationRepository.find({
      where: { userId, status },
      relations: ["company"],
      order: { createdAt: "DESC" },
    });

    res.json({
      applications: applications.map((application) => ({
        id: application.id,
        position: application.position,
        status: application.status,
        appliedDate: application.appliedDate,
        interviewDate: application.interviewDate,
        salary: application.salary,
        location: application.location,
        createdAt: application.createdAt,
        company: {
          id: application.company.id,
          name: application.company.name,
          website: application.company.website,
          industry: application.company.industry,
          location: application.company.location,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching applications by status:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

export default router;
