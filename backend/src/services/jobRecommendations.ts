import { postgresConnection } from "../config/database";
import { Job, JobLevel } from "../entities/Job";
import { Resume } from "../entities/Resume";
import { User } from "../entities/User";

interface JobScore {
  job: Job;
  score: number;
  reasons: string[];
}

interface UserProfile {
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  location?: string;
  preferredLevel?: JobLevel;
  preferredIndustries?: string[];
}

export class JobRecommendationService {
  private static readonly SKILL_MATCH_WEIGHT = 0.4;
  private static readonly LEVEL_MATCH_WEIGHT = 0.2;
  private static readonly LOCATION_MATCH_WEIGHT = 0.15;
  private static readonly INDUSTRY_MATCH_WEIGHT = 0.1;
  private static readonly RECENCY_WEIGHT = 0.1;
  private static readonly REMOTE_PREFERENCE_WEIGHT = 0.05;

  /**
   * Get personalized job recommendations for a user
   */
  static async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Job[]> {
    try {
      // Get user profile from resume
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return await this.getFallbackRecommendations(limit);
      }

      // Get all active jobs
      const allJobs = await this.getAllActiveJobs();

      // Score and rank jobs
      const scoredJobs = await this.scoreJobs(allJobs, userProfile);

      // Sort by score and return top recommendations
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.job);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return await this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Extract user profile from resume data
   */
  private static async getUserProfile(
    userId: string
  ): Promise<UserProfile | null> {
    const resume = await postgresConnection
      .createQueryBuilder(Resume, "resume")
      .where("resume.userId = :userId AND resume.isActive = :isActive", {
        userId,
        isActive: true,
      })
      .getOne();

    if (!resume || !resume.parsedData) {
      return null;
    }

    const { skills, experience, education, contact } = resume.parsedData;

    // Determine preferred level based on experience
    const preferredLevel = this.determineExperienceLevel(experience);

    // Extract location preference
    const location = contact?.location;

    // Extract preferred industries from experience
    const preferredIndustries = this.extractIndustries(experience);

    return {
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      location,
      preferredLevel,
      preferredIndustries,
    };
  }

  /**
   * Determine experience level based on work history
   */
  static determineExperienceLevel(experience: Array<any>): JobLevel {
    if (!experience || experience.length === 0) {
      return JobLevel.ENTRY;
    }

    // Calculate total years of experience
    let totalYears = 0;
    for (const exp of experience) {
      const duration = exp.duration || "";
      const years = this.extractYearsFromDuration(duration);
      totalYears += years;
    }

    // Map years to job level
    if (totalYears < 1) return JobLevel.ENTRY;
    if (totalYears < 3) return JobLevel.JUNIOR;
    if (totalYears < 5) return JobLevel.MID;
    if (totalYears < 8) return JobLevel.SENIOR;
    if (totalYears < 12) return JobLevel.LEAD;
    return JobLevel.EXECUTIVE;
  }

  /**
   * Extract years from duration string (e.g., "2 years 6 months" -> 2.5)
   */
  static extractYearsFromDuration(duration: string): number {
    const yearsMatch = duration.match(/(\d+)\s*year/);
    const monthsMatch = duration.match(/(\d+)\s*month/);

    const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;

    return years + months / 12;
  }

  /**
   * Extract industries from work experience
   */
  static extractIndustries(experience: Array<any>): string[] {
    const industries = new Set<string>();

    for (const exp of experience) {
      if (exp.company) {
        // Simple industry extraction - in a real app, you'd use a more sophisticated approach
        const industry = this.guessIndustryFromCompany(exp.company);
        if (industry) {
          industries.add(industry);
        }
      }
    }

    return Array.from(industries);
  }

  /**
   * Simple industry guessing based on company name
   */
  private static guessIndustryFromCompany(companyName: string): string | null {
    const name = companyName.toLowerCase();

    if (
      name.includes("tech") ||
      name.includes("software") ||
      name.includes("digital")
    ) {
      return "Technology";
    }
    if (
      name.includes("bank") ||
      name.includes("finance") ||
      name.includes("credit")
    ) {
      return "Finance";
    }
    if (
      name.includes("health") ||
      name.includes("medical") ||
      name.includes("pharma")
    ) {
      return "Healthcare";
    }
    if (
      name.includes("retail") ||
      name.includes("shop") ||
      name.includes("store")
    ) {
      return "Retail";
    }
    if (name.includes("consult") || name.includes("advisory")) {
      return "Consulting";
    }

    return null;
  }

  /**
   * Get all active jobs
   */
  private static async getAllActiveJobs(): Promise<Job[]> {
    return await postgresConnection
      .createQueryBuilder(Job, "job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.isActive = :isActive", { isActive: true })
      .orderBy("job.createdAt", "DESC")
      .getMany();
  }

  /**
   * Score jobs based on user profile
   */
  private static async scoreJobs(
    jobs: Job[],
    userProfile: UserProfile
  ): Promise<JobScore[]> {
    const scoredJobs: JobScore[] = [];

    for (const job of jobs) {
      const score = await this.calculateJobScore(job, userProfile);
      scoredJobs.push(score);
    }

    return scoredJobs;
  }

  /**
   * Calculate a score for a job based on user profile
   */
  private static async calculateJobScore(
    job: Job,
    userProfile: UserProfile
  ): Promise<JobScore> {
    let totalScore = 0;
    const reasons: string[] = [];

    // Skill matching (40% weight)
    const skillScore = this.calculateSkillMatch(job, userProfile.skills);
    totalScore += skillScore.score * this.SKILL_MATCH_WEIGHT;
    if (skillScore.reasons.length > 0) {
      reasons.push(...skillScore.reasons);
    }

    // Level matching (20% weight)
    const levelScore = this.calculateLevelMatch(
      job,
      userProfile.preferredLevel
    );
    totalScore += levelScore.score * this.LEVEL_MATCH_WEIGHT;
    if (levelScore.reasons.length > 0) {
      reasons.push(...levelScore.reasons);
    }

    // Location matching (15% weight)
    const locationScore = this.calculateLocationMatch(
      job,
      userProfile.location
    );
    totalScore += locationScore.score * this.LOCATION_MATCH_WEIGHT;
    if (locationScore.reasons.length > 0) {
      reasons.push(...locationScore.reasons);
    }

    // Industry matching (10% weight)
    const industryScore = this.calculateIndustryMatch(
      job,
      userProfile.preferredIndustries
    );
    totalScore += industryScore.score * this.INDUSTRY_MATCH_WEIGHT;
    if (industryScore.reasons.length > 0) {
      reasons.push(...industryScore.reasons);
    }

    // Recency bonus (10% weight)
    const recencyScore = this.calculateRecencyScore(job);
    totalScore += recencyScore.score * this.RECENCY_WEIGHT;
    if (recencyScore.reasons.length > 0) {
      reasons.push(...recencyScore.reasons);
    }

    // Remote preference (5% weight)
    const remoteScore = this.calculateRemotePreference(job);
    totalScore += remoteScore.score * this.REMOTE_PREFERENCE_WEIGHT;
    if (remoteScore.reasons.length > 0) {
      reasons.push(...remoteScore.reasons);
    }

    return {
      job,
      score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
      reasons: reasons.slice(0, 3), // Limit to top 3 reasons
    };
  }

  /**
   * Calculate skill match score
   */
  private static calculateSkillMatch(
    job: Job,
    userSkills: string[]
  ): { score: number; reasons: string[] } {
    if (!job.skills || job.skills.length === 0 || userSkills.length === 0) {
      return { score: 0, reasons: [] };
    }

    const jobSkills = job.skills.map((skill) => skill.toLowerCase());
    const userSkillsLower = userSkills.map((skill) => skill.toLowerCase());

    const matchingSkills = userSkillsLower.filter((skill) =>
      jobSkills.some(
        (jobSkill) => jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );

    const matchPercentage =
      matchingSkills.length / Math.max(jobSkills.length, userSkills.length);
    const score = Math.min(matchPercentage * 2, 1); // Scale up but cap at 1

    const reasons =
      matchingSkills.length > 0
        ? [`Matches ${matchingSkills.length} of your skills`]
        : [];

    return { score, reasons };
  }

  /**
   * Calculate level match score
   */
  private static calculateLevelMatch(
    job: Job,
    preferredLevel?: JobLevel
  ): { score: number; reasons: string[] } {
    if (!preferredLevel) {
      return { score: 0.5, reasons: [] }; // Neutral score if no preference
    }

    const levelHierarchy = {
      [JobLevel.ENTRY]: 1,
      [JobLevel.JUNIOR]: 2,
      [JobLevel.MID]: 3,
      [JobLevel.SENIOR]: 4,
      [JobLevel.LEAD]: 5,
      [JobLevel.EXECUTIVE]: 6,
    };

    const userLevel = levelHierarchy[preferredLevel];
    const jobLevel = levelHierarchy[job.level];

    const levelDiff = Math.abs(userLevel - jobLevel);
    let score = 1 - levelDiff * 0.2; // Reduce score by 20% per level difference
    score = Math.max(0, Math.min(1, score));

    const reasons =
      levelDiff === 0
        ? ["Perfect level match"]
        : levelDiff === 1
        ? ["Close level match"]
        : [];

    return { score, reasons };
  }

  /**
   * Calculate location match score
   */
  private static calculateLocationMatch(
    job: Job,
    userLocation?: string
  ): { score: number; reasons: string[] } {
    if (!userLocation || !job.location) {
      return { score: 0.5, reasons: [] }; // Neutral score
    }

    const userLocationLower = userLocation.toLowerCase();
    const jobLocationLower = job.location.toLowerCase();

    // Exact match
    if (userLocationLower === jobLocationLower) {
      return { score: 1, reasons: ["Location match"] };
    }

    // Partial match (same city or state)
    const userParts = userLocationLower.split(",").map((part) => part.trim());
    const jobParts = jobLocationLower.split(",").map((part) => part.trim());

    const hasCommonPart = userParts.some((part) =>
      jobParts.some(
        (jobPart) => part.includes(jobPart) || jobPart.includes(part)
      )
    );

    if (hasCommonPart) {
      return { score: 0.8, reasons: ["Nearby location"] };
    }

    // Remote job bonus
    if (job.remote) {
      return { score: 0.7, reasons: ["Remote opportunity"] };
    }

    return { score: 0.3, reasons: [] };
  }

  /**
   * Calculate industry match score
   */
  private static calculateIndustryMatch(
    job: Job,
    preferredIndustries?: string[]
  ): { score: number; reasons: string[] } {
    if (
      !preferredIndustries ||
      preferredIndustries.length === 0 ||
      !job.company?.industry
    ) {
      return { score: 0.5, reasons: [] }; // Neutral score
    }

    const jobIndustry = job.company.industry.toLowerCase();
    const userIndustries = preferredIndustries.map((industry) =>
      industry.toLowerCase()
    );

    const hasMatch = userIndustries.some(
      (industry) =>
        industry.includes(jobIndustry) || jobIndustry.includes(industry)
    );

    return {
      score: hasMatch ? 1 : 0.3,
      reasons: hasMatch ? ["Industry match"] : [],
    };
  }

  /**
   * Calculate recency score (newer jobs get higher scores)
   */
  private static calculateRecencyScore(job: Job): {
    score: number;
    reasons: string[];
  } {
    if (!job.postedDate) {
      return { score: 0.5, reasons: [] };
    }

    const daysSincePosted =
      (Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24);

    let score = 1;
    if (daysSincePosted <= 7) score = 1;
    else if (daysSincePosted <= 30) score = 0.9;
    else if (daysSincePosted <= 90) score = 0.7;
    else score = 0.5;

    const reasons = daysSincePosted <= 7 ? ["Recently posted"] : [];

    return { score, reasons };
  }

  /**
   * Calculate remote preference score
   */
  private static calculateRemotePreference(job: Job): {
    score: number;
    reasons: string[];
  } {
    // For now, give a slight bonus to remote jobs
    // In a real app, you'd check user preferences
    return {
      score: job.remote ? 0.8 : 0.5,
      reasons: job.remote ? ["Remote opportunity"] : [],
    };
  }

  /**
   * Get fallback recommendations when no user profile is available
   */
  private static async getFallbackRecommendations(
    limit: number
  ): Promise<Job[]> {
    return await postgresConnection
      .createQueryBuilder(Job, "job")
      .leftJoinAndSelect("job.company", "company")
      .where("job.isActive = :isActive", { isActive: true })
      .orderBy("job.createdAt", "DESC")
      .limit(limit)
      .getMany();
  }

  /**
   * Get top skills from all jobs
   */
  static getTopSkills(jobs: Job[]): string[] {
    const skillCount: { [key: string]: number } = {};

    jobs.forEach((job) => {
      job.skills?.forEach((skill) => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .map(([skill]) => skill);
  }

  /**
   * Get level recommendations
   */
  static getLevelRecommendations(level: JobLevel): string[] {
    const recommendations = {
      [JobLevel.ENTRY]: [
        "Focus on building a strong foundation in core technologies",
        "Contribute to open source projects",
        "Build a portfolio of personal projects",
      ],
      [JobLevel.JUNIOR]: [
        "Take on more complex projects",
        "Learn system design principles",
        "Start mentoring entry-level developers",
      ],
      [JobLevel.MID]: [
        "Lead small projects or features",
        "Develop expertise in specific domains",
        "Contribute to architectural decisions",
      ],
      [JobLevel.SENIOR]: [
        "Lead larger projects and teams",
        "Mentor junior and mid-level developers",
        "Drive technical strategy",
      ],
      [JobLevel.LEAD]: [
        "Lead engineering teams",
        "Define technical architecture",
        "Drive organizational change",
      ],
      [JobLevel.EXECUTIVE]: [
        "Lead entire engineering organizations",
        "Define company-wide technical strategy",
        "Represent company in technical matters",
      ],
    };

    return recommendations[level] || [];
  }

  /**
   * Get industry recommendations
   */
  static getIndustryRecommendations(industries: string[]): string[] {
    if (industries.length === 0) {
      return [
        "Consider exploring different industries to broaden your experience",
        "Look for roles in growing sectors like AI, FinTech, or HealthTech",
      ];
    }

    return [
      `Leverage your experience in ${industries.join(", ")}`,
      "Consider roles in related industries to expand your expertise",
      "Look for opportunities to apply your industry knowledge in new contexts",
    ];
  }
}
