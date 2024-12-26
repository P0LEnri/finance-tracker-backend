// src/routes/auth.ts
import { Router, Response, Request, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { authMiddleware, AuthRequest, } from "../middleware/auth";
import { UserService } from "../services/users.service";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService();

type RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Registro
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  (async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, email, password } = req.body;
      
      // Usar el servicio de usuario en lugar de la lógica directa
      const authResponse = await userService.createUser({ name, email, password });
      
      res.json(authResponse); // Esto ya incluirá el user con hasCompletedOnboarding y el token
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

// Login
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;
      
      // Usar el servicio de usuario
      const authResponse = await userService.loginUser(email, password);
      
      res.json(authResponse); // Esto ya incluirá el user con hasCompletedOnboarding y el token
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

// Obtener usuario actual
router.get("/me", authMiddleware, ((req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    hasCompletedOnboarding: req.user.hasCompletedOnboarding
  });
}) as RequestHandler);

// Logout
router.post("/logout", authMiddleware, ((req: AuthRequest, res: Response) => {
  res.json({ message: "Logged out successfully" });
}) as RequestHandler);

export default router;