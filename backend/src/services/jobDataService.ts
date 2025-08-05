import { postgresConnection } from "../config/database";
import { Job, JobLevel, JobType } from "../entities/Job";
import { Company } from "../entities/Company";

interface RawJob {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url?: string;
  postedDate?: string;
  skills?: string[];
  level?: JobLevel;
  type?: JobType;
  remote?: boolean;
  applicationUrl?: string;
  companyId?: string;
}

export class JobDataService {
  private static readonly ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
  private static readonly ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
  private static readonly USAJOBS_API_KEY = process.env.USAJOBS_API_KEY;

  /**
   * Initialize job data from real sources only
   */
  static async initializeJobData() {
    console.log("Initializing job data from real sources...");

    try {
      // 1. Fetch from free APIs (if configured)
      if (this.ADZUNA_APP_ID && this.ADZUNA_APP_KEY) {
        await this.fetchFromAdzuna();
      } else {
        console.log(
          "Adzuna API not configured - get free keys from https://developer.adzuna.com/"
        );
      }

      if (this.USAJOBS_API_KEY) {
        await this.fetchFromUSAJobs();
      } else {
        console.log(
          "USAJobs API not configured - get free key from https://developer.usajobs.gov/"
        );
      }

      // 2. Fetch from RSS feeds (always available)
      await this.fetchFromRSSFeeds();

      console.log("Job data initialization complete!");
    } catch (error) {
      console.error("Error initializing job data:", error);
    }
  }

  /**
   * Fetch jobs from Adzuna API (free tier)
   */
  private static async fetchFromAdzuna() {
    try {
      const keywords = [
        "software engineer",
        "developer",
        "data scientist",
        "devops",
        "frontend",
        "backend",
      ];

      for (const keyword of keywords) {
        const params = new URLSearchParams({
          app_id: this.ADZUNA_APP_ID!,
          app_key: this.ADZUNA_APP_KEY!,
          results_per_page: "20",
          what: keyword,
          content_type: "application/json",
        });

        const response = await fetch(
          `https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`
        );
        const data = (await response.json()) as any;

        if (data.results) {
          await this.processAdzunaJobs(data.results);
        }
      }

      console.log("Successfully fetched jobs from Adzuna");
    } catch (error) {
      console.error("Error fetching from Adzuna:", error);
    }
  }

  /**
   * Process and store Adzuna jobs
   */
  private static async processAdzunaJobs(rawJobs: any[]) {
    for (const rawJob of rawJobs) {
      try {
        // Check if job already exists
        const existingJob = await postgresConnection
          .createQueryBuilder(Job, "job")
          .where("job.title = :title AND job.company = :company", {
            title: rawJob.title,
            company: rawJob.company.display_name,
          })
          .getOne();

        if (existingJob) continue;

        // Create or find company
        let company = await postgresConnection
          .createQueryBuilder(Company, "company")
          .where("company.name = :name", { name: rawJob.company.display_name })
          .getOne();

        if (!company) {
          company = new Company();
          company.name = rawJob.company.display_name;
          company.website = rawJob.company.link || "";
          company.industry = "Technology"; // Default
          company.location = rawJob.location.display_name;
          company = await postgresConnection.manager.save(company);
        }

        // Create job
        const job = new Job();
        job.title = rawJob.title;
        job.description = rawJob.description;
        job.companyId = company.id;
        job.location = rawJob.location.display_name;
        job.salary = rawJob.salary_max ? `$${rawJob.salary_max}` : undefined;
        job.remote =
          rawJob.contract_time?.toLowerCase().includes("remote") || false;
        job.level = this.determineLevelFromTitle(rawJob.title);
        job.type = this.determineTypeFromContract(rawJob.contract_time);
        job.postedDate = new Date(rawJob.created);
        job.applicationUrl = rawJob.redirect_url;
        job.isActive = true;
        job.source = "adzuna";

        await postgresConnection.manager.save(job);
      } catch (error) {
        console.error("Error processing Adzuna job:", error);
      }
    }
  }

  /**
   * Fetch jobs from USAJobs API (free)
   */
  private static async fetchFromUSAJobs() {
    try {
      const keywords = [
        "Information Technology",
        "Computer Science",
        "Software",
        "Developer",
        "Engineer",
      ];

      for (const keyword of keywords) {
        const headers = {
          "Authorization-Key": this.USAJOBS_API_KEY!,
          Host: "data.usajobs.gov",
        };

        const params = new URLSearchParams({
          Keyword: keyword,
          ResultsPerPage: "20",
        });

        const response = await fetch(
          `https://data.usajobs.gov/api/search?${params}`,
          { headers }
        );
        const data = (await response.json()) as any;

        if (data.SearchResult?.SearchResultItems) {
          await this.processUSAJobs(data.SearchResult.SearchResultItems);
        }
      }

      console.log("Successfully fetched jobs from USAJobs");
    } catch (error) {
      console.error("Error fetching from USAJobs:", error);
    }
  }

  /**
   * Process and store USAJobs
   */
  private static async processUSAJobs(rawJobs: any[]) {
    for (const rawJob of rawJobs) {
      try {
        const jobData = rawJob.MatchedObjectDescriptor;

        // Check if job already exists
        const existingJob = await postgresConnection
          .createQueryBuilder(Job, "job")
          .where("job.title = :title AND job.company = :company", {
            title: jobData.PositionTitle,
            company: jobData.OrganizationName,
          })
          .getOne();

        if (existingJob) continue;

        // Create or find company
        let company = await postgresConnection
          .createQueryBuilder(Company, "company")
          .where("company.name = :name", { name: jobData.OrganizationName })
          .getOne();

        if (!company) {
          company = new Company();
          company.name = jobData.OrganizationName;
          company.industry = "Government";
          company.location = jobData.PositionLocationDisplay;
          company = await postgresConnection.manager.save(company);
        }

        // Create job
        const job = new Job();
        job.title = jobData.PositionTitle;
        job.description = jobData.QualificationSummary || jobData.Duties;
        job.companyId = company.id;
        job.location = jobData.PositionLocationDisplay;
        job.level = this.determineLevelFromTitle(jobData.PositionTitle);
        job.type = JobType.FULL_TIME; // Government jobs are typically full-time
        job.postedDate = new Date(jobData.PositionStartDate);
        job.applicationUrl = jobData.PositionURI;
        job.isActive = true;
        job.source = "usajobs";

        await postgresConnection.manager.save(job);
      } catch (error) {
        console.error("Error processing USAJobs job:", error);
      }
    }
  }

  /**
   * Fetch jobs from RSS feeds (completely free)
   */
  private static async fetchFromRSSFeeds() {
    const feeds = [
      "https://weworkremotely.com/categories/remote-programming-jobs.rss",
      "https://stackoverflow.com/jobs/feed",
      "https://jobs.github.com/positions.atom",
    ];

    for (const feedUrl of feeds) {
      try {
        const response = await fetch(feedUrl);
        const xml = await response.text();
        const jobs = await this.parseRSSFeed(xml, feedUrl);
        await this.processRSSJobs(jobs);
      } catch (error) {
        console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      }
    }
  }

  /**
   * Parse RSS feed XML
   */
  private static async parseRSSFeed(
    xml: string,
    sourceUrl: string
  ): Promise<any[]> {
    const jobs: any[] = [];

    // Extract job entries using regex (simplified)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;

    const regex = sourceUrl.includes("atom") ? entryRegex : itemRegex;
    const matches = xml.match(regex);

    if (matches) {
      for (const match of matches) {
        const titleMatch = match.match(/<title[^>]*>([^<]+)<\/title>/);
        const linkMatch = match.match(/<link[^>]*>([^<]+)<\/link>/);
        const descriptionMatch = match.match(
          /<description[^>]*>([^<]+)<\/description>/
        );
        const publishedMatch = match.match(
          /<published[^>]*>([^<]+)<\/published>/
        );

        if (titleMatch) {
          jobs.push({
            title: titleMatch[1].trim(),
            link: linkMatch ? linkMatch[1].trim() : "",
            description: descriptionMatch ? descriptionMatch[1].trim() : "",
            published: publishedMatch
              ? publishedMatch[1].trim()
              : new Date().toISOString(),
            source: sourceUrl,
          });
        }
      }
    }

    return jobs;
  }

  /**
   * Process and store RSS jobs
   */
  private static async processRSSJobs(rawJobs: any[]) {
    for (const rawJob of rawJobs) {
      try {
        // Extract company name from title (common pattern: "Job Title at Company")
        const companyMatch = rawJob.title.match(/at\s+(.+)$/);
        const companyName = companyMatch
          ? companyMatch[1].trim()
          : "Unknown Company";

        // Check if job already exists
        const existingJob = await postgresConnection
          .createQueryBuilder(Job, "job")
          .where("job.title = :title", { title: rawJob.title })
          .getOne();

        if (existingJob) continue;

        // Create or find company
        let company = await postgresConnection
          .createQueryBuilder(Company, "company")
          .where("company.name = :name", { name: companyName })
          .getOne();

        if (!company) {
          company = new Company();
          company.name = companyName;
          company.industry = "Technology";
          company.location = "Remote";
          company = await postgresConnection.manager.save(company);
        }

        // Create job
        const job = new Job();
        job.title = rawJob.title;
        job.description = rawJob.description;
        job.companyId = company.id;
        job.location = "Remote";
        job.level = this.determineLevelFromTitle(rawJob.title);
        job.type = JobType.FULL_TIME;
        job.postedDate = new Date(rawJob.published);
        job.applicationUrl = rawJob.link;
        job.isActive = true;
        job.source = "rss";

        await postgresConnection.manager.save(job);
      } catch (error) {
        console.error("Error processing RSS job:", error);
      }
    }
  }

  /**
   * Helper methods for job classification
   */
  private static determineLevelFromTitle(title: string): JobLevel {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("senior") ||
      lowerTitle.includes("lead") ||
      lowerTitle.includes("principal")
    ) {
      return JobLevel.SENIOR;
    }
    if (lowerTitle.includes("junior") || lowerTitle.includes("entry")) {
      return JobLevel.JUNIOR;
    }
    if (
      lowerTitle.includes("cto") ||
      lowerTitle.includes("vp") ||
      lowerTitle.includes("director")
    ) {
      return JobLevel.EXECUTIVE;
    }
    if (lowerTitle.includes("lead") || lowerTitle.includes("manager")) {
      return JobLevel.LEAD;
    }

    return JobLevel.MID; // Default to mid-level
  }

  private static determineTypeFromContract(contractTime?: string): JobType {
    if (!contractTime) return JobType.FULL_TIME;

    const lower = contractTime.toLowerCase();
    if (lower.includes("part")) return JobType.PART_TIME;
    if (lower.includes("contract")) return JobType.CONTRACT;
    if (lower.includes("intern")) return JobType.INTERNSHIP;
    if (lower.includes("freelance")) return JobType.FREELANCE;

    return JobType.FULL_TIME;
  }

  /**
   * Schedule regular job updates
   */
  static scheduleUpdates() {
    // Update every 6 hours
    setInterval(async () => {
      console.log("Running scheduled job update...");
      await this.initializeJobData();
    }, 6 * 60 * 60 * 1000);
  }
}
