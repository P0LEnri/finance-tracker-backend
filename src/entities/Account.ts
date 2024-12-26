import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Transaction } from "./Transaction";
import { AccountBalanceHistory } from "./AccountBalanceHistory";
import { RecurringTransaction } from "./RecurringTransaction";

export enum AccountType {
  CASH = "CASH",
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
  INVESTMENT = "INVESTMENT"
}

export enum InvestmentType {
  CETES = "CETES",
  CRYPTO = "CRYPTO",
  STOCKS = "STOCKS",
  SAVINGS = "SAVINGS",
  OTHER = "OTHER"
}

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "enum", enum: AccountType })
  type: AccountType;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ nullable: true })
  bank: string;

  @Column({ nullable: true })
  cardNumber: string;

  @Column({ nullable: true })
  paymentDay: number;

  @Column({ nullable: true })
  cutoffDay: number;

  @Column({ default: true })
  isActive: boolean;


  @Column({ type: "enum", enum: InvestmentType, nullable: true })
  investmentType: InvestmentType;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  annualReturn: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.accounts)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions: Transaction[];

  @OneToMany(() => AccountBalanceHistory, history => history.account)
  balanceHistory: AccountBalanceHistory[];

  @OneToMany(() => RecurringTransaction, recurringTransaction => recurringTransaction.account)
  recurringTransactions: RecurringTransaction[];
}