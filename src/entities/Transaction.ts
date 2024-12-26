import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Account } from "./Account";
import { Category } from "./Category";
import { Subcategory } from "./Subcategory";
import { Transfer } from "./Transfer";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER"
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: TransactionType })
  type: TransactionType;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "date" })
  transactionDate: Date;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ type: "text", nullable: true })
  originalText: string;

  @Column({ default: false })
  autoCategorized: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Account, account => account.transactions)
  @JoinColumn({ name: "account_id" })
  account: Account;

  @ManyToOne(() => Category, category => category.transactions)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Subcategory, subcategory => subcategory.transactions)
  @JoinColumn({ name: "subcategory_id" })
  subcategory: Subcategory;

  @OneToMany(() => Transfer, transfer => transfer.sourceTransaction)
  outgoingTransfers: Transfer[];

  @OneToMany(() => Transfer, transfer => transfer.destinationTransaction)
  incomingTransfers: Transfer[];
}
