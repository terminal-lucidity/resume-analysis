import { Router } from "express";
import { postgresConnection } from "../config/database";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = userSchema.parse(req.body);

    const userRepository = postgresConnection.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User();
    user.email = email;
    user.password = password;
    user.name = name;
    await user.hashPassword();

    await userRepository.save(user);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = userSchema.parse(req.body);

    const userRepository = postgresConnection.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

export default router;
