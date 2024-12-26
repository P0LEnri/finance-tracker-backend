import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth";
import onboardingRoutes from './routes/onboarding.routes';
import accountRoutes from './routes/accounts.routes'; 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/accounts", accountRoutes); 

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

// Database connection and server start
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));