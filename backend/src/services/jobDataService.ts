import { postgresConnection } from "../config/database";
import { Job, JobLevel, JobType } from "../entities/Job";
import { Company } from "../entities/Company";

interface JobSource {
  name: string;
  fetchJobs(): Promise<any[]>;
}

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
   * Initialize job data from all free sources
   */
  static async initializeJobData() {
    console.log("Initializing job data from free sources...");

    try {
      // 1. Enhanced seeding with more realistic data
      await this.seedEnhancedJobs();

      // 2. Fetch from free APIs (if configured)
      if (this.ADZUNA_APP_ID && this.ADZUNA_APP_KEY) {
        await this.fetchFromAdzuna();
      }

      if (this.USAJOBS_API_KEY) {
        await this.fetchFromUSAJobs();
      }

      // 3. Fetch from RSS feeds
      await this.fetchFromRSSFeeds();

      console.log("Job data initialization complete!");
    } catch (error) {
      console.error("Error initializing job data:", error);
    }
  }

  /**
   * Enhanced seeding with more realistic and diverse job data
   */
  private static async seedEnhancedJobs() {
    const companies = await this.createCompanies();
    const jobs = this.generateRealisticJobs(companies);

    for (const jobData of jobs) {
      const job = new Job();
      Object.assign(job, {
        ...jobData,
        postedDate: new Date(jobData.postedDate || Date.now()),
        isActive: true,
      });

      await postgresConnection.manager.save(job);
    }

    console.log(`Seeded ${jobs.length} enhanced jobs`);
  }

  /**
   * Create diverse companies for job seeding
   */
  private static async createCompanies(): Promise<Company[]> {
    const companyData = [
      {
        name: "TechCorp Solutions",
        website: "https://techcorp.com",
        industry: "Technology",
        size: "201-500",
        location: "San Francisco, CA",
        description:
          "Leading technology company focused on innovative solutions",
      },
      {
        name: "DataFlow Analytics",
        website: "https://dataflow.com",
        industry: "Data Science",
        size: "51-200",
        location: "New York, NY",
        description: "Advanced analytics and machine learning solutions",
      },
      {
        name: "CloudScale Systems",
        website: "https://cloudscale.com",
        industry: "Cloud Computing",
        size: "500+",
        location: "Austin, TX",
        description: "Enterprise cloud infrastructure and services",
      },
      {
        name: "DevWorks Studio",
        website: "https://devworks.com",
        industry: "Software Development",
        size: "11-50",
        location: "Remote",
        description: "Creative software development agency",
      },
      {
        name: "AI Innovations Lab",
        website: "https://aiinnovations.com",
        industry: "Artificial Intelligence",
        size: "51-200",
        location: "Seattle, WA",
        description: "Cutting-edge AI research and development",
      },
      {
        name: "FinTech Solutions",
        website: "https://fintechsolutions.com",
        industry: "Finance",
        size: "201-500",
        location: "Chicago, IL",
        description: "Innovative financial technology solutions",
      },
      {
        name: "HealthTech Pro",
        website: "https://healthtechpro.com",
        industry: "Healthcare",
        size: "51-200",
        location: "Boston, MA",
        description: "Digital health solutions and medical technology",
      },
      {
        name: "E-commerce Hub",
        website: "https://ecommercehub.com",
        industry: "Retail",
        size: "500+",
        location: "Los Angeles, CA",
        description: "Leading e-commerce platform and retail technology",
      },
      {
        name: "Startup Ventures",
        website: "https://startupventures.com",
        industry: "Technology",
        size: "11-50",
        location: "Miami, FL",
        description: "Innovative startup focused on emerging technologies",
      },
      {
        name: "Consulting Partners",
        website: "https://consultingpartners.com",
        industry: "Consulting",
        size: "201-500",
        location: "Washington, DC",
        description:
          "Strategic consulting services for technology transformation",
      },
    ];

    const companies = [];
    for (const data of companyData) {
      let company = await postgresConnection
        .createQueryBuilder(Company, "company")
        .where("company.name = :name", { name: data.name })
        .getOne();

      if (!company) {
        company = new Company();
        Object.assign(company, data);
        company = await postgresConnection.manager.save(company);
      }

      companies.push(company);
    }

    return companies;
  }

  /**
   * Generate realistic jobs with diverse roles and levels
   */
  private static generateRealisticJobs(companies: Company[]): RawJob[] {
    const jobTemplates = [
      // Entry Level Jobs
      {
        title: "Junior Frontend Developer",
        description:
          "Join our team as a Junior Frontend Developer and help build beautiful, responsive user interfaces. You'll work with React, TypeScript, and modern CSS frameworks while learning from experienced developers.",
        level: JobLevel.ENTRY,
        type: JobType.FULL_TIME,
        salary: "$65,000 - $80,000",
        remote: false,
        skills: ["React", "TypeScript", "CSS", "JavaScript", "Git"],
        benefits: [
          "Health Insurance",
          "401k",
          "Flexible PTO",
          "Learning Budget",
        ],
      },
      {
        title: "Data Analyst Intern",
        description:
          "Gain hands-on experience in data analysis and business intelligence. You'll work with real data sets, create reports, and help drive business decisions through data insights.",
        level: JobLevel.ENTRY,
        type: JobType.INTERNSHIP,
        salary: "$25/hour",
        remote: true,
        skills: ["SQL", "Python", "Excel", "Tableau", "Statistics"],
        benefits: ["Flexible Hours", "Mentorship", "Potential Full-time Offer"],
      },
      {
        title: "DevOps Engineer (Entry)",
        description:
          "Start your DevOps journey with hands-on experience in cloud infrastructure, automation, and deployment pipelines. Perfect for recent graduates with basic programming knowledge.",
        level: JobLevel.ENTRY,
        type: JobType.FULL_TIME,
        salary: "$70,000 - $85,000",
        remote: false,
        skills: ["Linux", "Docker", "AWS", "Python", "Git"],
        benefits: [
          "Health Insurance",
          "401k",
          "Home Office Setup",
          "Certification Budget",
        ],
      },

      // Junior Level Jobs
      {
        title: "Frontend Developer",
        description:
          "Create beautiful and responsive user interfaces using modern web technologies. You'll work with React, TypeScript, and collaborate with designers to deliver exceptional user experiences.",
        level: JobLevel.JUNIOR,
        type: JobType.FULL_TIME,
        salary: "$75,000 - $95,000",
        remote: true,
        skills: ["React", "TypeScript", "CSS", "JavaScript", "Git"],
        benefits: ["Health Insurance", "401k", "Remote Work", "Flexible PTO"],
      },
      {
        title: "Junior Data Scientist",
        description:
          "Apply your analytical skills to solve real-world problems. You'll work with machine learning models, analyze complex datasets, and help drive business insights through data.",
        level: JobLevel.JUNIOR,
        type: JobType.FULL_TIME,
        salary: "$80,000 - $100,000",
        remote: false,
        skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
        benefits: [
          "Health Insurance",
          "401k",
          "Learning Budget",
          "Conference Budget",
        ],
      },

      // Mid Level Jobs
      {
        title: "Senior Full Stack Developer",
        description:
          "Lead development of web applications using modern technologies. You'll work across the entire stack, mentor junior developers, and contribute to architectural decisions.",
        level: JobLevel.MID,
        type: JobType.FULL_TIME,
        salary: "$120,000 - $150,000",
        remote: false,
        skills: ["React", "Node.js", "Python", "PostgreSQL", "AWS"],
        benefits: ["Health Insurance", "401k", "Flexible PTO", "Stock Options"],
      },
      {
        title: "Data Scientist",
        description:
          "Join our data science team to build machine learning models and analyze large datasets. You will work on cutting-edge projects that drive business decisions.",
        level: JobLevel.MID,
        type: JobType.FULL_TIME,
        salary: "$100,000 - $130,000",
        remote: true,
        skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
        benefits: [
          "Health Insurance",
          "401k",
          "Remote Work",
          "Learning Budget",
        ],
      },
      {
        title: "Cloud Infrastructure Engineer",
        description:
          "Help us build and maintain scalable cloud infrastructure. You will work with AWS, Kubernetes, and modern DevOps practices to ensure reliable and efficient systems.",
        level: JobLevel.MID,
        type: JobType.FULL_TIME,
        salary: "$110,000 - $140,000",
        remote: false,
        skills: ["AWS", "Kubernetes", "Docker", "Terraform", "Linux"],
        benefits: [
          "Health Insurance",
          "401k",
          "Flexible Hours",
          "Conference Budget",
        ],
      },
      {
        title: "DevOps Engineer",
        description:
          "Streamline our development and deployment processes. You will work with CI/CD pipelines and cloud infrastructure to ensure smooth software delivery.",
        level: JobLevel.MID,
        type: JobType.FULL_TIME,
        salary: "$90,000 - $120,000",
        remote: true,
        skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Linux"],
        benefits: [
          "Health Insurance",
          "401k",
          "Remote Work",
          "Home Office Setup",
        ],
      },

      // Senior Level Jobs
      {
        title: "Senior Machine Learning Engineer",
        description:
          "Develop and deploy machine learning models at scale. You will work on cutting-edge AI projects that impact millions of users and lead technical initiatives.",
        level: JobLevel.SENIOR,
        type: JobType.FULL_TIME,
        salary: "$130,000 - $160,000",
        remote: false,
        skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker"],
        benefits: [
          "Health Insurance",
          "401k",
          "Stock Options",
          "Research Budget",
        ],
      },
      {
        title: "Senior Product Manager",
        description:
          "Lead product development from conception to launch. You will work closely with engineering, design, and business teams to deliver exceptional products.",
        level: JobLevel.SENIOR,
        type: JobType.FULL_TIME,
        salary: "$120,000 - $150,000",
        remote: false,
        skills: [
          "Product Strategy",
          "Agile",
          "User Research",
          "Analytics",
          "SQL",
        ],
        benefits: ["Health Insurance", "401k", "Stock Options", "Flexible PTO"],
      },
      {
        title: "Senior UX/UI Designer",
        description:
          "Create intuitive and beautiful user experiences. You will work on web and mobile applications and lead design initiatives across the company.",
        level: JobLevel.SENIOR,
        type: JobType.FULL_TIME,
        salary: "$100,000 - $130,000",
        remote: true,
        skills: [
          "Figma",
          "Sketch",
          "User Research",
          "Prototyping",
          "Design Systems",
        ],
        benefits: ["Health Insurance", "401k", "Remote Work", "Design Tools"],
      },

      // Lead Level Jobs
      {
        title: "Engineering Team Lead",
        description:
          "Lead a team of developers and drive technical excellence. You will be responsible for team performance, technical decisions, and project delivery.",
        level: JobLevel.LEAD,
        type: JobType.FULL_TIME,
        salary: "$140,000 - $180,000",
        remote: false,
        skills: [
          "Leadership",
          "System Design",
          "Agile",
          "Technical Architecture",
          "Team Management",
        ],
        benefits: [
          "Health Insurance",
          "401k",
          "Stock Options",
          "Leadership Training",
        ],
      },
      {
        title: "Data Science Lead",
        description:
          "Lead our data science initiatives and build a world-class analytics team. You will drive data strategy and ensure data-driven decision making across the organization.",
        level: JobLevel.LEAD,
        type: JobType.FULL_TIME,
        salary: "$130,000 - $170,000",
        remote: false,
        skills: [
          "Leadership",
          "Machine Learning",
          "Data Strategy",
          "Team Management",
          "Business Intelligence",
        ],
        benefits: [
          "Health Insurance",
          "401k",
          "Stock Options",
          "Conference Budget",
        ],
      },

      // Executive Level Jobs
      {
        title: "CTO (Chief Technology Officer)",
        description:
          "Lead our technology strategy and drive innovation across the organization. You will be responsible for all technical decisions and building a world-class engineering team.",
        level: JobLevel.EXECUTIVE,
        type: JobType.FULL_TIME,
        salary: "$200,000 - $300,000",
        remote: false,
        skills: [
          "Leadership",
          "Technology Strategy",
          "Team Building",
          "Business Strategy",
          "Innovation",
        ],
        benefits: [
          "Health Insurance",
          "401k",
          "Stock Options",
          "Executive Benefits",
        ],
      },
      {
        title: "VP of Engineering",
        description:
          "Lead our engineering organization and drive technical excellence. You will be responsible for team growth, technical strategy, and project delivery.",
        level: JobLevel.EXECUTIVE,
        type: JobType.FULL_TIME,
        salary: "$180,000 - $250,000",
        remote: false,
        skills: [
          "Leadership",
          "Engineering Management",
          "Technical Strategy",
          "Team Building",
          "Project Management",
        ],
        benefits: [
          "Health Insurance",
          "401k",
          "Stock Options",
          "Executive Benefits",
        ],
      },

      // Part-time and Contract Jobs
      {
        title: "Freelance Web Developer",
        description:
          "Join our network of freelance developers and work on exciting projects. Flexible hours and remote work available.",
        level: JobLevel.MID,
        type: JobType.FREELANCE,
        salary: "$50 - $80/hour",
        remote: true,
        skills: ["React", "Node.js", "JavaScript", "CSS", "Git"],
        benefits: ["Flexible Hours", "Remote Work", "Project Variety"],
      },
      {
        title: "Part-time Data Analyst",
        description:
          "Perfect for students or professionals looking for flexible work. Analyze data and create reports on a part-time basis.",
        level: JobLevel.JUNIOR,
        type: JobType.PART_TIME,
        salary: "$30 - $45/hour",
        remote: true,
        skills: ["SQL", "Excel", "Python", "Data Visualization", "Statistics"],
        benefits: ["Flexible Hours", "Remote Work", "Learning Opportunities"],
      },
    ];

    const jobs: RawJob[] = [];
    const locations = [
      "San Francisco, CA",
      "New York, NY",
      "Austin, TX",
      "Seattle, WA",
      "Chicago, IL",
      "Boston, MA",
      "Los Angeles, CA",
      "Washington, DC",
      "Miami, FL",
      "Denver, CO",
      "Portland, OR",
      "Atlanta, GA",
      "Remote",
    ];

    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i];
      const company = companies[i % companies.length];
      const location = locations[i % locations.length];

      // Add some randomness to make jobs more realistic
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const postedDate = new Date(
        Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000
      );

      jobs.push({
        ...template,
        company: company.name,
        location,
        postedDate: postedDate.toISOString(),
        applicationUrl: `${company.website}/careers/${template.title
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
        companyId: company.id,
      });
    }

    return jobs;
  }

  /**
   * Fetch jobs from Adzuna API (free tier)
   */
  private static async fetchFromAdzuna() {
    if (!this.ADZUNA_APP_ID || !this.ADZUNA_APP_KEY) {
      console.log("Adzuna API credentials not configured, skipping...");
      return;
    }

    try {
      const keywords = [
        "software engineer",
        "developer",
        "data scientist",
        "devops",
      ];

      for (const keyword of keywords) {
        const params = new URLSearchParams({
          app_id: this.ADZUNA_APP_ID,
          app_key: this.ADZUNA_APP_KEY,
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
    if (!this.USAJOBS_API_KEY) {
      console.log("USAJobs API key not configured, skipping...");
      return;
    }

    try {
      const keywords = [
        "Information Technology",
        "Computer Science",
        "Software",
      ];

      for (const keyword of keywords) {
        const headers = {
          "Authorization-Key": this.USAJOBS_API_KEY,
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
      "https://jobs.github.com/positions.atom",
      "https://stackoverflow.com/jobs/feed",
      "https://weworkremotely.com/categories/remote-programming-jobs.rss",
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
    // Simple XML parsing (in production, use a proper XML parser)
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
