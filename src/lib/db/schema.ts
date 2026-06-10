// ============================================================
// DATABASE SCHEMA — src/db/schema.ts
// ============================================================
// Think of this file as the blueprint for your database.
// Every "table" here becomes an actual table in Neon PostgreSQL.
// Drizzle reads this file and knows exactly how to structure data.
// ============================================================

import {
  pgTable, // Function to define a PostgreSQL table
  text, // A column that stores text/strings
  timestamp, // A column that stores date + time
  boolean, // A column that stores true/false
  numeric, // A column that stores decimal numbers (for money)
  pgEnum, // A column that only allows specific values
  primaryKey, // Marks which column is the unique identifier
  integer, // A column that stores whole numbers
  uuid, // A column that stores unique IDs (like "a3f9-...")
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2"; // For generating unique IDs

// ============================================================
// ENUMS — These are like dropdown menus for database columns.
// A column with an enum can ONLY store one of the listed values.
// ============================================================

// Transaction type: money either comes IN (income) or goes OUT (expense)
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

// Debt type: you either OWE money (payable) or someone owes YOU (receivable)
export const debtTypeEnum = pgEnum("debt_type", ["payable", "receivable"]);

// Debt status: is the debt still active or has it been paid?
export const debtStatusEnum = pgEnum("debt_status", ["active", "paid"]);

// Wallet currency options — Philippine Peso + major foreign currencies
export const currencyEnum = pgEnum("currency", [
  "PHP",
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "SGD",
  "AUD",
]);

// ============================================================
// USERS TABLE
// Stores everyone who signs up for Budgefy.
// This is connected to all other tables — every piece of data
// belongs to a specific user.
// ============================================================
export const users = pgTable("users", {
  // id: The unique identifier for each user. Auto-generated.
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // name: The user's display name (e.g., "En")
  name: text("name"),

  // email: Used for login. Must be unique — no two accounts share an email.
  email: text("email").notNull().unique(),

  // emailVerified: When the user verified their email (null = not verified yet)
  emailVerified: timestamp("email_verified", { mode: "date" }),

  // image: URL to their profile picture (used for Google login)
  image: text("image"),

  // password: Stored as a scrambled hash, never plain text.
  // null = user logged in via Google (no password needed)
  password: text("password"),

  // createdAt: The exact moment the account was created
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// ACCOUNTS TABLE (Required by NextAuth)
// When a user logs in with Google, NextAuth stores the
// Google account details here and links it to the user above.
// You don't interact with this table directly — NextAuth manages it.
// ============================================================
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(), // e.g., "google"
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    // The primary key is the combination of provider + providerAccountId
    // because one user could theoretically link multiple Google accounts
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

// ============================================================
// SESSIONS TABLE (Required by NextAuth)
// When a user logs in, NextAuth creates a "session" — like a
// temporary pass that proves who they are. This stores those passes.
// When you call auth() in your code, NextAuth checks this table.
// ============================================================
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ============================================================
// VERIFICATION TOKENS TABLE (Required by NextAuth)
// Used for "magic link" email verification.
// ============================================================
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// ============================================================
// WALLETS TABLE
// Each user can have multiple wallets (cash, GCash, BDO, etc.)
// Wallets can also be shared between users (you and your GF).
// ============================================================
export const wallets = pgTable("wallets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Which user owns this wallet
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Wallet name — e.g., "GCash", "BDO Savings", "Piggy Bank"
  name: text("name").notNull(),

  // Which currency this wallet uses
  currency: currencyEnum("currency").notNull().default("PHP"),

  // Current balance — stored as text to avoid floating point errors with money
  balance: numeric("balance", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),

  // Wallet icon name (from Lucide React icon library)
  icon: text("icon").default("wallet"),

  // Color to show in the UI (hex color code like "#1a6358")
  color: text("color").default("#1a6358"),

  // isShared: if true, other users can be invited to see/use this wallet
  isShared: boolean("is_shared").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// WALLET MEMBERS TABLE
// Links wallets to additional users (for shared wallets).
// Example: You own a wallet, and your GF is a member of it.
// ============================================================
export const walletMembers = pgTable(
  "wallet_members",
  {
    walletId: text("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // When they were added as a member
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (wm) => ({
    compoundKey: primaryKey({ columns: [wm.walletId, wm.userId] }),
  }),
);

// ============================================================
// CATEGORIES TABLE
// Categories classify transactions (Food, Transport, Bills, etc.)
// Each user gets default categories + can create their own.
// userId = null means it's a default category available to everyone.
// ============================================================
export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // null = this is a system default (available to all users)
  // a userId = this was created by that specific user
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // e.g., "Food & Dining"
  icon: text("icon").default("tag"), // Lucide icon name
  color: text("color").default("#6b7280"),

  // Which type of transaction is this category for?
  type: transactionTypeEnum("type").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// TRANSACTIONS TABLE
// This is the most important table. Every peso that comes in
// or goes out is recorded here.
// ============================================================
export const transactions = pgTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Which user made this transaction
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Which wallet the money came from/went to
  walletId: text("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),

  // Which category (Food, Transport, etc.)
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  // income or expense
  type: transactionTypeEnum("type").notNull(),

  // The amount of money — 15 digits total, 2 decimal places
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  // Optional description — e.g., "Jollibee lunch with GF"
  description: text("description"),

  // The actual date of the transaction (not when it was entered)
  date: timestamp("date", { mode: "date" }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// BUDGETS TABLE
// Users set spending limits — either for the whole month
// or per category per month.
// ============================================================
export const budgets = pgTable("budgets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // null = this is the OVERALL budget for the month
  // a categoryId = this is a per-category budget
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "cascade",
  }),

  // The spending limit amount
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),

  // Which month and year this budget applies to
  // Stored as numbers: month = 1-12, year = 2024
  month: integer("month").notNull(),
  year: integer("year").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// DEBTS TABLE
// Tracks money you owe others (payable) and money others owe you (receivable).
// ============================================================
export const debts = pgTable("debts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // payable = you owe this to someone
  // receivable = someone owes this to you
  type: debtTypeEnum("type").notNull(),

  // The name of the person you owe or who owes you
  personName: text("person_name").notNull(),

  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull().default("PHP"),

  // Description — e.g., "Borrowed for electric bill"
  description: text("description"),

  // When is this debt due?
  dueDate: timestamp("due_date", { mode: "date" }),

  // active = still unpaid, paid = settled
  status: debtStatusEnum("status").notNull().default("active"),

  // When was it actually paid?
  paidAt: timestamp("paid_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// RELATIONS — This tells Drizzle how tables connect to each other.
// It's like drawing lines between tables in a diagram.
// This enables "include" queries (get user WITH their wallets, etc.)
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  wallets: many(wallets),
  transactions: many(transactions),
  budgets: many(budgets),
  debts: many(debts),
  categories: many(categories),
  walletMemberships: many(walletMembers),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  owner: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
  members: many(walletMembers),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const debtsRelations = relations(debts, ({ one }) => ({
  user: one(users, { fields: [debts.userId], references: [users.id] }),
}));
