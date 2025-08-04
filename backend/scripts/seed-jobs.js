const { postgresConnection } = require("../src/config/database");
const { Job, JobLevel, JobType } = require("../src/entities/Job");
const { Company } = require("../src/entities/Company");

const sampleCompanies = [
  {
    name: "TechCorp Solutions",
    website: "https://techcorp.com",
    industry: "Technology",
    size: "201-500",
    location: "San Francisco, CA",
    description: "Leading technology company focused on innovative solutions",
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
];

const sampleJobs = [
  {
    title: "Senior Full Stack Developer",
    description:
      "We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies like React, Node.js, and Python.",
    level: JobLevel.SENIOR,
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
    ],
    experienceYears: 3,
    applicationUrl: "https://dataflow.com/careers/data-scientist",
  },
  {
    title: "Cloud Infrastructure Engineer",
    description:
      "Help us build and maintain scalable cloud infrastructure. You will work with AWS, Kubernetes, and modern DevOps practices.",
    level: JobLevel.SENIOR,
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
    ],
    experienceYears: 4,
    applicationUrl: "https://cloudscale.com/careers/infrastructure-engineer",
  },
  {
    title: "Frontend Developer",
    description:
      "Create beautiful and responsive user interfaces. You will work with React, TypeScript, and modern CSS frameworks.",
    level: JobLevel.JUNIOR,
    type: JobType.FULL_TIME,
    location: "Remote",
    salary: "$70,000 - $90,000",
    remote: true,
    skills: ["React", "TypeScript", "CSS", "JavaScript", "Git"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Flexible PTO"],
    responsibilities: [
      "Build responsive user interfaces",
      "Collaborate with designers",
      "Write clean, maintainable code",
      "Participate in team meetings",
    ],
    experienceYears: 2,
    applicationUrl: "https://devworks.com/careers/frontend-developer",
  },
  {
    title: "Machine Learning Engineer",
    description:
      "Develop and deploy machine learning models at scale. You will work on cutting-edge AI projects that impact millions of users.",
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
    ],
    experienceYears: 5,
    applicationUrl: "https://aiinnovations.com/careers/ml-engineer",
  },
  {
    title: "DevOps Engineer",
    description:
      "Streamline our development and deployment processes. You will work with CI/CD pipelines and cloud infrastructure.",
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
    ],
    experienceYears: 3,
    applicationUrl: "https://techcorp.com/careers/devops-engineer",
  },
  {
    title: "Product Manager",
    description:
      "Lead product development from conception to launch. You will work closely with engineering, design, and business teams.",
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
    ],
    experienceYears: 5,
    applicationUrl: "https://dataflow.com/careers/product-manager",
  },
  {
    title: "UX/UI Designer",
    description:
      "Create intuitive and beautiful user experiences. You will work on web and mobile applications.",
    level: JobLevel.MID,
    type: JobType.FULL_TIME,
    location: "Remote",
    salary: "$80,000 - $110,000",
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
    ],
    experienceYears: 3,
    applicationUrl: "https://devworks.com/careers/ux-designer",
  },
];

async function seedJobs() {
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

    // Create jobs
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const company = companies[i % companies.length]; // Distribute jobs across companies

      const job = new Job();
      Object.assign(job, {
        ...jobData,
        companyId: company.id,
        postedDate: new Date(),
        isActive: true,
      });

      const savedJob = await postgresConnection.manager.save(job);
      console.log(`Created job: ${savedJob.title} at ${company.name}`);
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedJobs();
