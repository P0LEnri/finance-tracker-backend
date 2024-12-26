// src/routes/onboarding.routes.ts
import { Router, NextFunction, Response, Request } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { AccountType, InvestmentType } from '../entities/Account';
import { CategoryType } from '../entities/Category';

const router = Router();
const onboardingController = new OnboardingController();

// Middleware de validación
const validateOnboardingData = [
  body('accounts').isArray(),
  body('accounts.*.type').isIn(['CASH', 'DEBIT', 'CREDIT', 'INVESTMENT']),
  body('accounts.*.name').notEmpty(),
  body('accounts.*.balance').isNumeric(),
  // Validaciones adicionales para campos opcionales
  body('accounts.*.creditLimit').optional().isNumeric(),
  body('accounts.*.paymentDay').optional().isInt({ min: 1, max: 31 }),
  body('accounts.*.cutoffDay').optional().isInt({ min: 1, max: 31 }),
  body('accounts.*.bank').optional().isString(),
  body('accounts.*.cardNumber').optional().isString(),
  body('accounts.*.investmentType').optional().isIn(['STOCKS', 'BONDS', 'MUTUAL_FUNDS', 'OTHER']),
  body('accounts.*.annualReturn').optional().isNumeric(),
  body('accounts.*.notes').optional().isString(),
  
  body('categories').isArray(),
  body('categories.*.type').isIn(['INCOME', 'EXPENSE']),
  body('categories.*.name').notEmpty(),
  body('categories.*.subcategories').isArray(),
  body('categories.*.subcategories.*').isString()
];

// Interfaces alineadas con el controller
interface AccountDTO {
  type: AccountType;
  name: string;
  balance: number;
  bank?: string;
  cardNumber?: string;
  creditLimit?: number;
  cutoffDay?: number;
  paymentDay?: number;
  investmentType?: InvestmentType;
  annualReturn?: number;
  notes?: string;
}

interface CategoryDTO {
  type: CategoryType;
  name: string;
  subcategories: string[];
}

interface OnboardingRequest {
  accounts: AccountDTO[];
  categories: CategoryDTO[];
}

// Route handler
router.post(
  '/complete',
  authMiddleware,
  validateOnboardingData,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
  (req: AuthRequest, res: Response) => onboardingController.completeOnboarding(req, res)
);

export default router;