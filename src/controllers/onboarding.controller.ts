// src/controllers/onboarding.controller.ts
import { Request, Response } from 'express';
import { AccountService } from '../services/accounts.service';
import { CategoryService } from '../services/categories.service';
import { UserService } from '../services/users.service';
import { AccountType, InvestmentType } from '../entities/Account';
import { CategoryType } from '../entities/Category';
import { AuthRequest } from '../middleware/auth';

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

interface OnboardingDTO {
  accounts: AccountDTO[];
  categories: CategoryDTO[];
}

export class OnboardingController {
  private accountService: AccountService;
  private categoryService: CategoryService;
  private userService: UserService;

  constructor() {
    this.accountService = new AccountService();
    this.categoryService = new CategoryService();
    this.userService = new UserService();
  }

  async completeOnboarding(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body as OnboardingDTO;
      const authResponse = await this.userService.updateOnboardingStatus(userId, true);

      // Crear las cuentas
      const accountPromises = data.accounts.map(accountData => {
        return this.accountService.createAccount(userId, {
          name: accountData.name,
          type: accountData.type,
          initialBalance: accountData.balance,
          creditLimit: accountData.creditLimit,
          paymentDay: accountData.paymentDay,
          cutoffDay: accountData.cutoffDay,
          bank: accountData.bank,
          cardNumber: accountData.cardNumber,
          investmentType: accountData.investmentType,
          annualReturn: accountData.annualReturn,
          notes: accountData.notes
        });
      });

      // Crear las categorías y sus subcategorías
      const categoryPromises = data.categories.map(async categoryData => {
        const category = await this.categoryService.createCategory(userId, {
          name: categoryData.name,
          type: categoryData.type,
        });

        // Si la categoría tiene subcategorías, crearlas
        if (categoryData.subcategories && categoryData.subcategories.length > 0) {
          const subcategoryPromises = categoryData.subcategories.map(subcategoryName =>
            this.categoryService.createSubcategory(category.id, {
              name: subcategoryName,
              categoryId: category.id
            })
          );
          await Promise.all(subcategoryPromises);
        }

        return category;
      });

      // Ejecutar todas las promesas
      await Promise.all([
        ...accountPromises,
        ...categoryPromises
      ]);

      // Actualizar el estado de onboarding del usuario
      await this.userService.updateOnboardingStatus(userId, true);

      res.status(200).json({
        message: 'Onboarding completado exitosamente',
        user: authResponse.user,
        token: authResponse.token
      });
    } catch (error) {
      console.error('Error en completeOnboarding:', error);
      res.status(500).json({
        message: 'Error al completar el onboarding',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}