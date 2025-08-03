import express from "express";
import { Company } from "../entities/Company";
import { postgresConnection } from "../config/database";
import { authenticateToken } from "../middleware/auth";
import { User } from "../entities/User";

const router = express.Router();

// Get all companies for the user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const companyRepository = postgresConnection.getRepository(Company);

    const companies = await companyRepository.find({
      order: { createdAt: "DESC" },
    });

    res.json({
      companies: companies.map((company) => ({
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        description: company.description,
        isFavorite: company.isFavorite,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// Get specific company
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyRepository = postgresConnection.getRepository(Company);

    const company = await companyRepository.findOne({
      where: { id: companyId },
      relations: ["applications"],
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// Create new company
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, website, industry, size, location, description, companyInfo } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const companyRepository = postgresConnection.getRepository(Company);

    // Check if company already exists
    const existingCompany = await companyRepository.findOne({
      where: { name: name.trim() },
    });

    if (existingCompany) {
      return res.status(400).json({ error: "Company already exists" });
    }

    const company = companyRepository.create({
      name: name.trim(),
      website,
      industry,
      size,
      location,
      description,
      companyInfo,
    });

    await companyRepository.save(company);

    res.status(201).json({
      message: "Company created successfully",
      company: {
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        description: company.description,
        companyInfo: company.companyInfo,
        isFavorite: company.isFavorite,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

// Update company
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name, website, industry, size, location, description, companyInfo, isFavorite } = req.body;

    const companyRepository = postgresConnection.getRepository(Company);

    const company = await companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Check if name is being changed and if it conflicts with existing company
    if (name && name !== company.name) {
      const existingCompany = await companyRepository.findOne({
        where: { name: name.trim() },
      });

      if (existingCompany) {
        return res.status(400).json({ error: "Company name already exists" });
      }
    }

    // Update company fields
    if (name !== undefined) company.name = name.trim();
    if (website !== undefined) company.website = website;
    if (industry !== undefined) company.industry = industry;
    if (size !== undefined) company.size = size;
    if (location !== undefined) company.location = location;
    if (description !== undefined) company.description = description;
    if (companyInfo !== undefined) company.companyInfo = companyInfo;
    if (isFavorite !== undefined) company.isFavorite = isFavorite;

    await companyRepository.save(company);

    res.json({
      message: "Company updated successfully",
      company: {
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        description: company.description,
        companyInfo: company.companyInfo,
        isFavorite: company.isFavorite,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

// Toggle favorite status
router.patch("/:id/favorite", authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyRepository = postgresConnection.getRepository(Company);

    const company = await companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    company.isFavorite = !company.isFavorite;
    await companyRepository.save(company);

    res.json({
      message: `Company ${company.isFavorite ? "added to" : "removed from"} favorites`,
      isFavorite: company.isFavorite,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite status" });
  }
});

// Delete company
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyRepository = postgresConnection.getRepository(Company);

    const company = await companyRepository.findOne({
      where: { id: companyId },
      relations: ["applications"],
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Check if company has applications
    if (company.applications && company.applications.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete company with existing applications. Please delete applications first." 
      });
    }

    await companyRepository.remove(company);

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

export default router; 