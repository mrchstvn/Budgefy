// TABLES IN THIS FILE:
//   1. users         — stores account info (name, email, password)
//   2. transactions  — every money in/out record
//   3. budgets       — spending limits per category
//   4. debts         — loans and debts to track
//   5. categories    — labels for transactions (food, rent, etc.)
// ============================================================

import {
  pgTable, // function to create a PostgreSQL table
  text, // a column that stores text (words)
  varchar, // text with a max length limit
  integer, // a column that stores whole numbers
  numeric, // a column for money (supports decimals)
  boolean, // a column that is either true or false
  timestamp, // a column that stores date AND time
  pgEnum, // creates a dropdown-like list of allowed values
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── ENUMS (like dropdown choices) ────────────────────────────
// These restrict what values can be saved in certain columns.
// Think of them as multiple-choice options.

// A transaction is either money coming IN or going OUT
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income", // money received (salary, gifts, etc.)
  "expense", // money spent (food, bills, etc.)
]);

// A debt can be money someone OWES YOU or money YOU OWE someone
export const debtTypeEnum = pgEnum("debt_type", [
  "owed_to_me", // someone borrowed from you
  "i_owe", // you borrowed from someone
]);

// The status of a debt
export const debtStatusEnum = pgEnum("debt_status", [
  "pending", // not yet paid
  "partial", // partially paid
  "paid", // fully paid
]);

// Supported currencies in our app
export const currencyEnum = pgEnum("currency", ["PHP", "USD"]);

// ── TABLE 1: USERS ────────────────────────────────────────────
// This table stores one row per user who signs up.
export const users = pgTable("users", {
  // A unique ID for each user (like a student ID number)
  // Generated automatically — you never type this yourself
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // The user's display name (e.g., "Juan dela Cruz")
  name: varchar("name", { length: 100 }).notNull(),

  // Email address — must be unique (no two accounts with same email)
  email: varchar("email", { length: 255 }).notNull().unique(),

  // The password — stored as a "hash" (scrambled for security)
  // We NEVER store the real password in plain text
  password: text("password_hash").notNull(),

  // Their preferred currency: PHP or USD (default: PHP)
  currency: currencyEnum("currency").default("PHP").notNull(),

  // Their timezone (e.g., "Asia/Manila") for correct date display
  timezone: varchar("timezone", { length: 50 })
    .default("Asia/Manila")
    .notNull(),

  // When they created their account
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),

  // When they last updated their profile
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// ── TABLE 2: CATEGORIES ───────────────────────────────────────
// Categories are labels like "Food", "Rent", "Salary", etc.
// Users can create their own categories.
export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Which user owns this category
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // "cascade" means: if the user is deleted, delete their categories too

  // The category name (e.g., "Groceries", "Netflix", "Salary")
  name: varchar("name", { length: 50 }).notNull(),

  // An emoji icon for visual identification (e.g., "🍔", "💡", "💰")
  icon: varchar("icon", { length: 10 }).default("📦"),

  // What color to show this category in (hex color code, e.g., "#3B82F6")
  color: varchar("color", { length: 7 }).default("#6B7280"),

  // Is this for income or expense categories?
  type: transactionTypeEnum("type").notNull(),

  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
});

// ── TABLE 3: TRANSACTIONS ────────────────────────────────────
// Every time money comes in or goes out, it's recorded here.
// This is the most important table in the whole app.
export const transactions = pgTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Which user made this transaction
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // What category does this belong to? (optional)
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  // "set null" means: if category is deleted, keep the transaction
  // but remove the category link

  // Is it income (money in) or expense (money out)?
  type: transactionTypeEnum("type").notNull(),

  // How much money? Stored as text for precision (e.g., "1234.50")
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

  // Which currency was used for this transaction
  currency: currencyEnum("currency").default("PHP").notNull(),

  // A short note about this transaction (e.g., "Jollibee dinner")
  description: varchar("description", { length: 255 }).notNull(),

  // The actual date this happened (not when it was recorded)
  date: timestamp("date").notNull(),

  // Optional longer note for extra details
  notes: text("notes"),

  // When this record was created in the system
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// ── TABLE 4: BUDGETS ──────────────────────────────────────────
// Budgets set a spending LIMIT for a category in a time period.
// Example: "I will only spend ₱5,000 on food in January 2025"
export const budgets = pgTable("budgets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  // The budget name (e.g., "January Food Budget")
  name: varchar("name", { length: 100 }).notNull(),

  // Maximum spending allowed
  limitAmount: numeric("limit_amount", { precision: 12, scale: 2 }).notNull(),

  currency: currencyEnum("currency").default("PHP").notNull(),

  // Which month does this budget cover? (1 = January, 12 = December)
  month: integer("month").notNull(),

  // Which year? (e.g., 2025)
  year: integer("year").notNull(),

  // Is this budget still active?
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// ── TABLE 5: DEBTS ────────────────────────────────────────────
// Track money you borrowed from or lent to others.
export const debts = pgTable("debts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // The other person's name (who you owe or who owes you)
  personName: varchar("person_name", { length: 100 }).notNull(),

  // A description of why this debt exists
  description: varchar("description", { length: 255 }).notNull(),

  // The original amount of the debt
  originalAmount: numeric("original_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),

  // How much has been paid back so far
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),

  currency: currencyEnum("currency").default("PHP").notNull(),

  // "owed_to_me" = they owe you | "i_owe" = you owe them
  type: debtTypeEnum("type").notNull(),

  // Current status of the debt
  status: debtStatusEnum("status").default("pending").notNull(),

  // Optional due date for repayment
  dueDate: timestamp("due_date"),

  // When was this debt created?
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// ── TYPE EXPORTS ──────────────────────────────────────────────
// These let us use the table types in our TypeScript code.
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type Debt = typeof debts.$inferSelect;
export type NewDebt = typeof debts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
