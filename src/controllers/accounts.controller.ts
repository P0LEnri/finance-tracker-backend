import { Request, Response } from 'express';
import { AccountService } from '../services/accounts.service';
import { AccountType } from '../entities/Account';
import { ValidationError } from 'class-validator';
import { AuthRequest } from '../middleware/auth'; 

export class AccountController {
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  async createAccount(req: AuthRequest, res: Response) {
    try {
    const userId = req.user!.id; // Asumiendo que el middleware de auth añade el usuario
      const { name, type, initialBalance, creditLimit, paymentDay, cutoffDay } = req.body;

      // Validaciones básicas
      if (!name || !type || !Object.values(AccountType).includes(type)) {
        return res.status(400).json({ message: 'Datos de cuenta inválidos' });
      }

      // Validaciones específicas para tarjetas de crédito
      if (type === AccountType.CREDIT) {
        if (!creditLimit || !paymentDay || !cutoffDay) {
          return res.status(400).json({ 
            message: 'Las tarjetas de crédito requieren límite de crédito, día de pago y día de corte' 
          });
        }
      }

      const account = await this.accountService.createAccount(userId, {
        name,
        type,
        initialBalance,
        creditLimit,
        paymentDay,
        cutoffDay
      });

      res.status(201).json(account);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: 'Error de validación', errors: error });
      } else {
        res.status(500).json({ message: 'Error al crear la cuenta' });
      }
    }
  }

  async getAccounts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const accounts = await this.accountService.getAccountsByUser(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las cuentas' });
    }
  }

  async getAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;
      const account = await this.accountService.getAccountById(accountId, userId);

      if (!account) {
        return res.status(404).json({ message: 'Cuenta no encontrada' });
      }

      res.json(account);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la cuenta' });
    }
  }

  async updateAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;
      const updateData = req.body;

      const account = await this.accountService.updateAccount(accountId, userId, updateData);

      if (!account) {
        return res.status(404).json({ message: 'Cuenta no encontrada' });
      }

      res.json(account);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la cuenta' });
    }
  }

  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;

      const success = await this.accountService.deleteAccount(accountId, userId);

      if (!success) {
        return res.status(404).json({ message: 'Cuenta no encontrada' });
      }

      res.json({ message: 'Cuenta eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la cuenta' });
    }
  }

  async getBalanceHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Se requieren fechas de inicio y fin' });
      }

      const history = await this.accountService.getBalanceHistory(
        accountId, 
        userId,
        {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        }
      );

      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el historial de balance' });
    }
  }
}
