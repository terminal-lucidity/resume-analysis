const { postgresConnection } = require("../dist/config/database");
const { Job, JobLevel, JobType } = require("../dist/entities/Job");
const { Company } = require("../dist/entities/Company");

const sampleCompanies = [
  {
    name: "TechCorp Solutions",
    website: "https://techcorp.com",
    industry: "Technology",
    size: "201-500",
    location: "San Francisco, CA",
    description:
      "Leading technology company focused on innovative solutions for enterprise clients",
  },
  {
    name: "DataFlow Analytics",
    website: "https://dataflow.com",
    industry: "Data Science",
    size: "51-200",
    location: "New York, NY",
    description:
      "Advanced analytics and machine learning solutions for data-driven businesses",
  },
  {
    name: "CloudScale Systems",
    website: "https://cloudscale.com",
    industry: "Cloud Computing",
    size: "500+",
    location: "Austin, TX",
    description: "Enterprise cloud infrastructure and services provider",
  },
  {
    name: "DevWorks Studio",
    website: "https://devworks.com",
    industry: "Software Development",
    size: "11-50",
    location: "Remote",
    description:
      "Creative software development agency specializing in web and mobile apps",
  },
  {
    name: "AI Innovations Lab",
    website: "https://aiinnovations.com",
    industry: "Artificial Intelligence",
    size: "51-200",
    location: "Seattle, WA",
    description: "Cutting-edge AI research and development company",
  },
  {
    name: "FinTech Solutions",
    website: "https://fintechsolutions.com",
    industry: "Finance",
    size: "201-500",
    location: "Chicago, IL",
    description: "Innovative financial technology solutions for modern banking",
  },
  {
    name: "HealthTech Pro",
    website: "https://healthtechpro.com",
    industry: "Healthcare",
    size: "51-200",
    location: "Boston, MA",
    description: "Digital health solutions and medical technology innovations",
  },
  {
    name: "E-commerce Hub",
    website: "https://ecommercehub.com",
    industry: "Retail",
    size: "500+",
    location: "Los Angeles, CA",
    description: "Leading e-commerce platform and retail technology solutions",
  },
  {
    name: "Consulting Partners",
    website: "https://consultingpartners.com",
    industry: "Consulting",
    size: "201-500",
    location: "Washington, DC",
    description:
      "Strategic consulting services for technology and business transformation",
  },
  {
    name: "Startup Ventures",
    website: "https://startupventures.com",
    industry: "Technology",
    size: "11-50",
    location: "Miami, FL",
    description: "Innovative startup focused on emerging technologies",
  },
];

const sampleJobs = [
  // Entry Level Jobs
  {
    title: "Junior Frontend Developer",
    description:
      "Join our team as a Junior Frontend Developer and help build beautiful, responsive user interfaces. You'll work with React, TypeScript, and modern CSS frameworks while learning from experienced developers.",
    level: JobLevel.ENTRY,
    type: JobType.FULL_TIME,
    location: "San Francisco, CA",
    salary: "$65,000 - $80,000",
    remote: false,
    skills: ["React", "TypeScript", "CSS", "JavaScript", "Git"],
    benefits: ["Health Insurance", "401k", "Flexible PTO", "Learning Budget"],
    responsibilities: [
      "Build responsive user interfaces",
      "Collaborate with designers and backend developers",
      "Write clean, maintainable code",
      "Participate in code reviews",
      "Learn and grow with the team",
    ],
    experienceYears: 0,
    applicationUrl: "https://techcorp.com/careers/junior-frontend",
  },
  {
    title: "Data Analyst Intern",
    description:
      "Gain hands-on experience in data analysis and business intelligence. You'll work with real data sets, create reports, and help drive business decisions through data insights.",
    level: JobLevel.ENTRY,
    type: JobType.INTERNSHIP,
    location: "New York, NY",
    salary: "$25/hour",
    remote: true,
    skills: ["SQL", "Python", "Excel", "Tableau", "Statistics"],
    benefits: ["Flexible Hours", "Mentorship", "Potential Full-time Offer"],
    responsibilities: [
      "Analyze large datasets",
      "Create data visualizations",
      "Generate business reports",
      "Support data-driven decision making",
      "Learn advanced analytics tools",
    ],
    experienceYears: 0,
    applicationUrl: "https://dataflow.com/careers/data-analyst-intern",
  },
  {
    title: "DevOps Engineer (Entry)",
    description:
      "Start your DevOps journey with hands-on experience in cloud infrastructure, automation, and deployment pipelines. Perfect for recent graduates with basic programming knowledge.",
    level: JobLevel.ENTRY,
    type: JobType.FULL_TIME,
    location: "Austin, TX",
    salary: "$70,000 - $85,000",
    remote: false,
    skills: ["Linux", "Docker", "AWS", "Python", "Git"],
    benefits: [
      "Health Insurance",
      "401k",
      "Home Office Setup",
      "Certification Budget",
    ],
    responsibilities: [
      "Learn cloud infrastructure management",
      "Assist with deployment automation",
      "Monitor system performance",
      "Support development teams",
      "Gain hands-on experience with modern tools",
    ],
    experienceYears: 0,
    applicationUrl: "https://cloudscale.com/careers/devops-entry",
  },

  // Junior Level Jobs
  {
    title: "Frontend Developer",
    description:
      "Create beautiful and responsive user interfaces using modern web technologies. You'll work with React, TypeScript, and collaborate with designers to deliver exceptional user experiences.",
    level: JobLevel.JUNIOR,
    type: JobType.FULL_TIME,
    location: "Remote",
    salary: "$75,000 - $95,000",
    remote: true,
    skills: ["React", "TypeScript", "CSS", "JavaScript", "Git"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Flexible PTO"],
    responsibilities: [
      "Build responsive user interfaces",
      "Collaborate with designers",
      "Write clean, maintainable code",
      "Participate in team meetings",
      "Contribute to technical decisions",
    ],
    experienceYears: 2,
    applicationUrl: "https://devworks.com/careers/frontend-developer",
  },
  {
    title: "Junior Data Scientist",
    description:
      "Apply your analytical skills to solve real-world problems. You'll work with machine learning models, analyze complex datasets, and help drive business insights through data.",
    level: JobLevel.JUNIOR,
    type: JobType.FULL_TIME,
    location: "Seattle, WA",
    salary: "$80,000 - $100,000",
    remote: false,
    skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
    benefits: [
      "Health Insurance",
      "401k",
      "Learning Budget",
      "Conference Budget",
    ],
    responsibilities: [
      "Build and test ML models",
      "Analyze complex datasets",
      "Present findings to stakeholders",
      "Collaborate with engineering teams",
      "Contribute to research projects",
    ],
    experienceYears: 2,
    applicationUrl: "https://aiinnovations.com/careers/junior-data-scientist",
  },

  // Mid Level Jobs
  {
    title: "Senior Full Stack Developer",
    description:
      "Lead development of web applications using modern technologies. You'll work across the entire stack, mentor junior developers, and contribute to architectural decisions.",
    level: JobLevel.MID,
    type: JobType.FULL_TIME,
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    remote: false,
    skills: ["React", "Node.js", "Python", "PostgreSQL", "AWS"],
    benefits: ["Health Insurance", "401k", "Flexible PTO", "Stock Options"],
    responsibilities: [
      "Develop and maintain web applications",
      "Collaborate with cross-functional teams",
      "Mentor junior developers",
      "Participate in code reviews",
      "Contribute to technical architecture",
    ],
    experienceYears: 5,
    applicationUrl: "https://techcorp.com/careers/senior-developer",
  },
  {
    title: "Data Scientist",
    description:
      "Join our data science team to build machine learning models and analyze large datasets. You will work on cutting-edge projects that drive business decisions.",
    level: JobLevel.MID,
    type: JobType.FULL_TIME,
    location: "New York, NY",
    salary: "$100,000 - $130,000",
    remote: true,
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Learning Budget"],
    responsibilities: [
      "Build and deploy ML models",
      "Analyze complex datasets",
      "Present findings to stakeholders",
      "Collaborate with engineering teams",
      "Lead data science projects",
    ],
    experienceYears: 3,
    applicationUrl: "https://dataflow.com/careers/data-scientist",
  },
  {
    title: "Cloud Infrastructure Engineer",
    description:
      "Help us build and maintain scalable cloud infrastructure. You will work with AWS, Kubernetes, and modern DevOps practices to ensure reliable and efficient systems.",
    level: JobLevel.MID,
    type: JobType.FULL_TIME,
    location: "Austin, TX",
    salary: "$110,000 - $140,000",
    remote: false,
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "Linux"],
    benefits: [
      "Health Insurance",
      "401k",
      "Flexible Hours",
      "Conference Budget",
    ],
    responsibilities: [
      "Design and implement cloud infrastructure",
      "Automate deployment processes",
      "Monitor system performance",
      "Ensure security best practices",
      "Mentor junior engineers",
    ],
    experienceYears: 4,
    applicationUrl: "https://cloudscale.com/careers/infrastructure-engineer",
  },
  {
    title: "DevOps Engineer",
    description:
      "Streamline our development and deployment processes. You will work with CI/CD pipelines and cloud infrastructure to ensure smooth software delivery.",
    level: JobLevel.MID,
    type: JobType.FULL_TIME,
    location: "Remote",
    salary: "$90,000 - $120,000",
    remote: true,
    skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Linux"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Home Office Setup"],
    responsibilities: [
      "Maintain CI/CD pipelines",
      "Automate deployment processes",
      "Monitor system health",
      "Collaborate with development teams",
      "Implement infrastructure as code",
    ],
    experienceYears: 3,
    applicationUrl: "https://techcorp.com/careers/devops-engineer",
  },

  // Senior Level Jobs
  {
    title: "Senior Machine Learning Engineer",
    description:
      "Develop and deploy machine learning models at scale. You will work on cutting-edge AI projects that impact millions of users and lead technical initiatives.",
    level: JobLevel.SENIOR,
    type: JobType.FULL_TIME,
    location: "Seattle, WA",
    salary: "$130,000 - $160,000",
    remote: false,
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Docker"],
    benefits: ["Health Insurance", "401k", "Stock Options", "Research Budget"],
    responsibilities: [
      "Develop ML models and algorithms",
      "Deploy models to production",
      "Optimize model performance",
      "Collaborate with research teams",
      "Lead technical architecture decisions",
    ],
    experienceYears: 5,
    applicationUrl: "https://aiinnovations.com/careers/ml-engineer",
  },
  {
    title: "Senior Product Manager",
    description:
      "Lead product development from conception to launch. You will work closely with engineering, design, and business teams to deliver exceptional products.",
    level: JobLevel.SENIOR,
    type: JobType.FULL_TIME,
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    remote: false,
    skills: ["Product Strategy", "Agile", "User Research", "Analytics", "SQL"],
    benefits: ["Health Insurance", "401k", "Stock Options", "Flexible PTO"],
    responsibilities: [
      "Define product strategy and roadmap",
      "Gather and prioritize requirements",
      "Work with cross-functional teams",
      "Analyze product metrics",
      "Lead product initiatives",
    ],
    experienceYears: 5,
    applicationUrl: "https://dataflow.com/careers/product-manager",
  },
  {
    title: "Senior UX/UI Designer",
    description:
      "Create intuitive and beautiful user experiences. You will work on web and mobile applications and lead design initiatives across the company.",
    level: JobLevel.SENIOR,
    type: JobType.FULL_TIME,
    location: "Remote",
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
    responsibilities: [
      "Create user interface designs",
      "Conduct user research",
      "Build design systems",
      "Collaborate with developers",
      "Lead design strategy",
    ],
    experienceYears: 5,
    applicationUrl: "https://devworks.com/careers/senior-ux-designer",
  },

  // Lead Level Jobs
  {
    title: "Engineering Team Lead",
    description:
      "Lead a team of developers and drive technical excellence. You will be responsible for team performance, technical decisions, and project delivery.",
    level: JobLevel.LEAD,
    type: JobType.FULL_TIME,
    location: "Chicago, IL",
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
    responsibilities: [
      "Lead engineering team",
      "Make technical architecture decisions",
      "Mentor team members",
      "Drive project delivery",
      "Collaborate with product and design",
    ],
    experienceYears: 7,
    applicationUrl: "https://fintechsolutions.com/careers/engineering-lead",
  },
  {
    title: "Data Science Lead",
    description:
      "Lead our data science initiatives and build a world-class analytics team. You will drive data strategy and ensure data-driven decision making across the organization.",
    level: JobLevel.LEAD,
    type: JobType.FULL_TIME,
    location: "Boston, MA",
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
    responsibilities: [
      "Lead data science team",
      "Define data strategy",
      "Drive business insights",
      "Mentor data scientists",
      "Collaborate with executive team",
    ],
    experienceYears: 8,
    applicationUrl: "https://healthtechpro.com/careers/data-science-lead",
  },

  // Executive Level Jobs
  {
    title: "CTO (Chief Technology Officer)",
    description:
      "Lead our technology strategy and drive innovation across the organization. You will be responsible for all technical decisions and building a world-class engineering team.",
    level: JobLevel.EXECUTIVE,
    type: JobType.FULL_TIME,
    location: "Los Angeles, CA",
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
    responsibilities: [
      "Define technology strategy",
      "Lead engineering organization",
      "Drive innovation initiatives",
      "Make strategic technical decisions",
      "Represent company in technical matters",
    ],
    experienceYears: 15,
    applicationUrl: "https://ecommercehub.com/careers/cto",
  },
  {
    title: "VP of Engineering",
    description:
      "Lead our engineering organization and drive technical excellence. You will be responsible for team growth, technical strategy, and project delivery.",
    level: JobLevel.EXECUTIVE,
    type: JobType.FULL_TIME,
    location: "Washington, DC",
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
    responsibilities: [
      "Lead engineering organization",
      "Define technical strategy",
      "Build and mentor teams",
      "Drive project delivery",
      "Collaborate with executive team",
    ],
    experienceYears: 12,
    applicationUrl: "https://consultingpartners.com/careers/vp-engineering",
  },

  // Part-time and Contract Jobs
  {
    title: "Freelance Web Developer",
    description:
      "Join our network of freelance developers and work on exciting projects. Flexible hours and remote work available.",
    level: JobLevel.MID,
    type: JobType.FREELANCE,
    location: "Remote",
    salary: "$50 - $80/hour",
    remote: true,
    skills: ["React", "Node.js", "JavaScript", "CSS", "Git"],
    benefits: ["Flexible Hours", "Remote Work", "Project Variety"],
    responsibilities: [
      "Develop web applications",
      "Collaborate with project teams",
      "Meet project deadlines",
      "Maintain code quality",
      "Communicate with clients",
    ],
    experienceYears: 3,
    applicationUrl: "https://startupventures.com/careers/freelance-developer",
  },
  {
    title: "Part-time Data Analyst",
    description:
      "Perfect for students or professionals looking for flexible work. Analyze data and create reports on a part-time basis.",
    level: JobLevel.JUNIOR,
    type: JobType.PART_TIME,
    location: "Miami, FL",
    salary: "$30 - $45/hour",
    remote: true,
    skills: ["SQL", "Excel", "Python", "Data Visualization", "Statistics"],
    benefits: ["Flexible Hours", "Remote Work", "Learning Opportunities"],
    responsibilities: [
      "Analyze datasets",
      "Create reports",
      "Generate visualizations",
      "Support business decisions",
      "Learn new tools and techniques",
    ],
    experienceYears: 1,
    applicationUrl: "https://startupventures.com/careers/part-time-analyst",
  },
];

async function seedJobsEnhanced() {
  try {
    await postgresConnection.initialize();
    console.log("Connected to database");

    // Create companies first
    const companies = [];
    for (const companyData of sampleCompanies) {
      const company = new Company();
      Object.assign(company, companyData);
      const savedCompany = await postgresConnection.manager.save(company);
      companies.push(savedCompany);
      console.log(`Created company: ${savedCompany.name}`);
    }

    // Create jobs with more realistic distribution
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const company = companies[i % companies.length]; // Distribute jobs across companies

      const job = new Job();
      Object.assign(job, {
        ...jobData,
        companyId: company.id,
        postedDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // Random date within last 30 days
        isActive: true,
      });

      const savedJob = await postgresConnection.manager.save(job);
      console.log(
        `Created job: ${savedJob.title} at ${company.name} (${savedJob.level} level)`
      );
    }

    console.log("Enhanced database seeded successfully!");
    console.log(
      `Created ${companies.length} companies and ${sampleJobs.length} jobs`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedJobsEnhanced();
