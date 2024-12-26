import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Transaction } from "./Transaction";

@Entity("transfers")
export class Transfer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Transaction, transaction => transaction.outgoingTransfers)
  @JoinColumn({ name: "source_transaction_id" })
  sourceTransaction: Transaction;

  @ManyToOne(() => Transaction, transaction => transaction.incomingTransfers)
  @JoinColumn({ name: "destination_transaction_id" })
  destinationTransaction: Transaction;
}
