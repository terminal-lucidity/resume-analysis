import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { postgresConnection } from "../config/database";
import { User } from "../entities/User";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Create a constant for the validated JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const userRepository = postgresConnection.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};
