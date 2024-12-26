import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Account } from "./Account";
import { Category } from "./Category";
import { Subcategory } from "./Subcategory";

export enum RecurringTransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}

export enum Frequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY"
}

@Entity("recurring_transactions")
export class RecurringTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: RecurringTransactionType })
  type: RecurringTransactionType;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: Frequency })
  frequency: Frequency;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @Column({ type: "date", nullable: true })
  lastGeneratedDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.recurringTransactions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Account, account => account.recurringTransactions)
  @JoinColumn({ name: "account_id" })
  account: Account;

  @ManyToOne(() => Category, category => category.recurringTransactions)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Subcategory, subcategory => subcategory.recurringTransactions)
  @JoinColumn({ name: "subcategory_id" })
  subcategory: Subcategory;
}