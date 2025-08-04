import express from "express";
import { authenticateToken } from "../middleware/auth";
import { postgresConnection } from "../config/database";
import { Job, JobLevel, JobType } from "../entities/Job";
import { Company } from "../entities/Company";
import { Resume } from "../entities/Resume";
import { User } from "../entities/User";
import { JobRecommendationService } from "../services/jobRecommendations";

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
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = req.user as User;
    const userId = user.id;
    const { limit = 10 } = req.query;

    // Use the improved recommendation service
    const recommendedJobs = await JobRecommendationService.getRecommendations(
      userId,
      Number(limit)
    );

    res.json({ jobs: recommendedJobs });
  } catch (error) {
    console.error("Error fetching job recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Get recommendation insights for a user
router.get("/recommendations/insights", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = req.user as User;
    const userId = user.id;

    // Get user's resume
    const resume = await postgresConnection
      .createQueryBuilder(Resume, "resume")
      .where("resume.userId = :userId AND resume.isActive = :isActive", {
        userId,
        isActive: true,
      })
      .getOne();

    if (!resume || !resume.parsedData) {
      return res.status(404).json({ error: "No active resume found" });
    }

    const { skills, experience } = resume.parsedData;

    // Analyze skills gap
    const allJobs = await postgresConnection
      .createQueryBuilder(Job, "job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.isActive = :isActive", { isActive: true })
      .getMany();

    const topSkills = JobRecommendationService.getTopSkills(allJobs);
    const missingSkills = topSkills.filter(
      (skill) =>
        !skills?.some(
          (userSkill) =>
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
        )
    );

    // Get experience level
    const experienceLevel = JobRecommendationService.determineExperienceLevel(
      experience || []
    );

    // Get industry preferences
    const preferredIndustries = JobRecommendationService.extractIndustries(
      experience || []
    );

    res.json({
      insights: {
        skills: {
          current: skills || [],
          topDemanded: topSkills.slice(0, 10),
          missing: missingSkills.slice(0, 5),
          gapAnalysis: `You have ${
            skills?.length || 0
          } skills, but the market demands ${
            topSkills.length
          } key skills. Consider learning: ${missingSkills
            .slice(0, 3)
            .join(", ")}`,
        },
        experience: {
          level: experienceLevel,
          years: JobRecommendationService.extractYearsFromDuration(
            experience?.[0]?.duration || "0 years"
          ),
          recommendations:
            JobRecommendationService.getLevelRecommendations(experienceLevel),
        },
        industries: {
          preferred: preferredIndustries,
          recommendations:
            JobRecommendationService.getIndustryRecommendations(
              preferredIndustries
            ),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching recommendation insights:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
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
