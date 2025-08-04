import express from "express";
import { authenticateToken } from "../middleware/auth";
import { postgresConnection } from "../config/database";
import { Job, JobLevel, JobType } from "../entities/Job";
import { Company } from "../entities/Company";
import { Resume } from "../entities/Resume";

const router = express.Router();

// Get all jobs with filters
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      search,
      level,
      type,
      location,
      remote,
      company,
      limit = 20,
      offset = 0,
    } = req.query;

    const queryBuilder = postgresConnection
      .createQueryBuilder(Job, "job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.isActive = :isActive", { isActive: true });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        "(job.title ILIKE :search OR job.description ILIKE :search OR company.name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (level) {
      queryBuilder.andWhere("job.level = :level", { level });
    }

    if (type) {
      queryBuilder.andWhere("job.type = :type", { type });
    }

    if (location) {
      queryBuilder.andWhere("job.location ILIKE :location", {
        location: `%${location}%`,
      });
    }

    if (remote !== undefined) {
      queryBuilder.andWhere("job.remote = :remote", {
        remote: remote === "true",
      });
    }

    if (company) {
      queryBuilder.andWhere("company.name ILIKE :company", {
        company: `%${company}%`,
      });
    }

    const jobs = await queryBuilder
      .orderBy("job.createdAt", "DESC")
      .limit(Number(limit))
      .offset(Number(offset))
      .getMany();

    const total = await queryBuilder.getCount();

    res.json({
      jobs,
      total,
      hasMore: total > Number(offset) + jobs.length,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Get job recommendations based on user's resume
router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's active resume
    const resume = await postgresConnection
      .createQueryBuilder(Resume, "resume")
      .where("resume.userId = :userId AND resume.isActive = :isActive", {
        userId,
        isActive: true,
      })
      .getOne();

    if (!resume) {
      return res.status(404).json({ error: "No active resume found" });
    }

    // Extract skills and experience from resume
    const resumeSkills = resume.skills || [];
    const resumeExperience = resume.experience || [];
    const resumeLevel = resume.level || JobLevel.MID;

    // Build recommendation query
    const queryBuilder = postgresConnection
      .createQueryBuilder(Job, "job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.isActive = :isActive", { isActive: true });

    // Match by skills (if available)
    if (resumeSkills.length > 0) {
      const skillConditions = resumeSkills
        .map((_, index) => `job.skills @> :skill${index}`)
        .join(" OR ");

      queryBuilder.andWhere(`(${skillConditions})`);

      resumeSkills.forEach((skill, index) => {
        queryBuilder.setParameter(`skill${index}`, JSON.stringify([skill]));
      });
    }

    // Match by level
    queryBuilder.andWhere("job.level = :level", { level: resumeLevel });

    // Get recommended jobs
    const recommendedJobs = await queryBuilder
      .orderBy("job.createdAt", "DESC")
      .limit(Number(limit))
      .getMany();

    // If not enough recommendations, get more jobs with broader criteria
    if (recommendedJobs.length < Number(limit)) {
      const remainingLimit = Number(limit) - recommendedJobs.length;
      const additionalJobs = await postgresConnection
        .createQueryBuilder(Job, "job")
        .leftJoinAndSelect("job.company", "company")
        .where("job.isActive = :isActive", { isActive: true })
        .andWhere("job.id NOT IN (:...jobIds)", {
          jobIds: recommendedJobs.map((job) => job.id),
        })
        .orderBy("job.createdAt", "DESC")
        .limit(remainingLimit)
        .getMany();

      recommendedJobs.push(...additionalJobs);
    }

    res.json({ jobs: recommendedJobs });
  } catch (error) {
    console.error("Error fetching job recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Get job by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await postgresConnection
      .createQueryBuilder(Job, "job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.id = :id", { id })
      .getOne();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Create a new job (for testing/demo purposes)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      companyId,
      level,
      type,
      location,
      salary,
      remote,
      requirements,
      skills,
      benefits,
      responsibilities,
      experienceYears,
      applicationUrl,
      jobDetails,
    } = req.body;

    const job = new Job();
    job.title = title;
    job.description = description;
    job.companyId = companyId;
    job.level = level || JobLevel.MID;
    job.type = type || JobType.FULL_TIME;
    job.location = location;
    job.salary = salary;
    job.remote = remote;
    job.requirements = requirements;
    job.skills = skills;
    job.benefits = benefits;
    job.responsibilities = responsibilities;
    job.experienceYears = experienceYears;
    job.applicationUrl = applicationUrl;
    job.jobDetails = jobDetails;
    job.postedDate = new Date();

    await postgresConnection.manager.save(job);

    res.status(201).json({ job });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
});

export default router;
