import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Account, AccountType, InvestmentType } from '../entities/Account';
import { AccountBalanceHistory } from '../entities/AccountBalanceHistory';
import { User } from '../entities/User';

export class AccountService {
  private accountRepository: Repository<Account>;
  private balanceHistoryRepository: Repository<AccountBalanceHistory>;

  constructor() {
    this.accountRepository = AppDataSource.getRepository(Account);
    this.balanceHistoryRepository = AppDataSource.getRepository(AccountBalanceHistory);
  }

  async createAccount(userId: string, accountData: {
    name: string;
    type: AccountType;
    initialBalance?: number;
    creditLimit?: number;
    paymentDay?: number;
    bank?: string;
    cardNumber?: string;
    cutoffDay?: number;
    investmentType?: InvestmentType;
    annualReturn?: number;
    notes?: string;
  }): Promise<Account> {
    const account = this.accountRepository.create({
      ...accountData,
      currentBalance: accountData.initialBalance || 0,
      user: { id: userId } as User
    });

    await this.accountRepository.save(account);

    // Registrar el balance inicial en el historial
    if (accountData.initialBalance) {
      const balanceHistory = this.balanceHistoryRepository.create({
        account,
        balance: accountData.initialBalance
      });
      await this.balanceHistoryRepository.save(balanceHistory);
    }

    return account;
  }

  async getAccountsByUser(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async getAccountById(accountId: string, userId: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { id: accountId, user: { id: userId }, isActive: true }
    });
  }

  async updateAccount(accountId: string, userId: string, updateData: {
    name?: string;
    creditLimit?: number;
    paymentDay?: number;
    cutoffDay?: number;
    bank?: string;
    cardNumber?: string;
    isActive?: boolean;
    investmentType?: string;
    annualReturn?: number;
    notes?: string;
  }): Promise<Account | null> {
    const account = await this.getAccountById(accountId, userId);
    if (!account) return null;

    Object.assign(account, updateData);
    return this.accountRepository.save(account);
  }

  async updateBalance(accountId: string, userId: string, newBalance: number): Promise<Account | null> {
    const account = await this.getAccountById(accountId, userId);
    if (!account) return null;

    account.currentBalance = newBalance;
    await this.accountRepository.save(account);

    // Registrar el nuevo balance en el historial
    const balanceHistory = this.balanceHistoryRepository.create({
      account,
      balance: newBalance
    });
    await this.balanceHistoryRepository.save(balanceHistory);

    return account;
  }

  async getBalanceHistory(accountId: string, userId: string, 
    period: { startDate: Date, endDate: Date }): Promise<AccountBalanceHistory[]> {
    const account = await this.getAccountById(accountId, userId);
    if (!account) return [];

    return this.balanceHistoryRepository.find({
        where: {
            account: { id: accountId },
            recordedAt: Between(period.startDate, period.endDate)
        },
        order: { recordedAt: 'ASC' }
    });
}

  async deleteAccount(accountId: string, userId: string): Promise<boolean> {
    const account = await this.getAccountById(accountId, userId);
    if (!account) return false;

    account.isActive = false;
    await this.accountRepository.save(account);
    return true;
  }
}