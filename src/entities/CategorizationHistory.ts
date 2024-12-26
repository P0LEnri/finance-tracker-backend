import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Transaction } from "./Transaction";
import { Category } from "./Category";
import { Subcategory } from "./Subcategory";

@Entity("categorization_history")
export class CategorizationHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  confidenceScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: "transaction_id" })
  transaction: Transaction;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "original_category_id" })
  originalCategory: Category;

  @ManyToOne(() => Subcategory)
  @JoinColumn({ name: "original_subcategory_id" })
  originalSubcategory: Subcategory;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "final_category_id" })
  finalCategory: Category;

  @ManyToOne(() => Subcategory)
  @JoinColumn({ name: "final_subcategory_id" })
  finalSubcategory: Subcategory;
}