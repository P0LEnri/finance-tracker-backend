// src/config/database.ts
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Subcategory } from "../entities/Subcategory";
import { Account } from "../entities/Account";
import { AccountBalanceHistory } from "../entities/AccountBalanceHistory";
import { Transaction } from "../entities/Transaction";
import { Transfer } from "../entities/Transfer";
import { RecurringTransaction } from "../entities/RecurringTransaction";
import { CategorizationHistory } from "../entities/CategorizationHistory";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "123",
  database: process.env.DB_NAME || "finance_tracker",
  synchronize: true, // Solo en desarrollo
  logging: true,
  entities: [
    User,
    Category,
    Subcategory,
    Account,
    AccountBalanceHistory,
    Transaction,
    Transfer,
    RecurringTransaction,
    CategorizationHistory
  ],
  subscribers: [],
  migrations: [],
});