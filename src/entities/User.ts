import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { hash, compare } from "bcryptjs";
import { Account } from "./Account";
import { Category } from "./Category";
import { Transaction } from "./Transaction";
import { RecurringTransaction } from "./RecurringTransaction";
import "reflect-metadata";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  
  @Column({ default: false })
  hasCompletedOnboarding: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => RecurringTransaction, recurringTransaction => recurringTransaction.user)
  recurringTransactions: RecurringTransaction[];

  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  }
}