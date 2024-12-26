import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Category } from "./Category";
import { Transaction } from "./Transaction";
import { RecurringTransaction } from "./RecurringTransaction";

@Entity("subcategories")
export class Subcategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Category, category => category.subcategories)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @OneToMany(() => Transaction, transaction => transaction.subcategory)
  transactions: Transaction[];

  @OneToMany(() => RecurringTransaction, recurringTransaction => recurringTransaction.subcategory)
  recurringTransactions: RecurringTransaction[];
}
