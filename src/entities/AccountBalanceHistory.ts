import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Account } from "./Account";

@Entity("account_balances_history")
export class AccountBalanceHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  balance: number;

  @CreateDateColumn()
  recordedAt: Date;

  @ManyToOne(() => Account, account => account.balanceHistory)
  @JoinColumn({ name: "account_id" })
  account: Account;
}