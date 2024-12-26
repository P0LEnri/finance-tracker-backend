// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export interface AuthRequest extends Request {
  user?: User;
}

interface JwtPayload {
  id: string;
  hasCompletedOnboarding: boolean; 
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
      async (err, decoded) => {
        if (err) {
          res.status(401).json({ message: "Invalid token" });
          return;
        }

        const payload = decoded as JwtPayload;
        const userRepository = AppDataSource.getRepository(User);
        
        try {
          const user = await userRepository.findOne({ where: { id: payload.id } });

          if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
          }

          req.user = user;
          next();
        } catch (error) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};