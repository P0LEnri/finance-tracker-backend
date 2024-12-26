import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Subcategory } from "./Subcategory";
import { Transaction } from "./Transaction";
import { RecurringTransaction } from "./RecurringTransaction";

export enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "enum", enum: CategoryType })
  type: CategoryType;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.categories)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Subcategory, subcategory => subcategory.category)
  subcategories: Subcategory[];

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];

  @OneToMany(() => RecurringTransaction, recurringTransaction => recurringTransaction.category)
  recurringTransactions: RecurringTransaction[];
}