import { Router } from "express";
import { postgresConnection } from "../config/database";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";
import { z } from "zod";
import passport from "../passport";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
    if (name) {
      user.name = name;
    }
    await user.hashPassword();

    await userRepository.save(user);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
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

// --- Google OAuth ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: FRONTEND_URL + "/signin?error=google",
  }),
  (req: any, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

// --- GitHub OAuth ---
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: FRONTEND_URL + "/signin?error=github",
  }),
  (req: any, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

export default router;
