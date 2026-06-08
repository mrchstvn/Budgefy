// src/lib/validations.ts
// All Zod validation schemas for the app.
// These are used on the frontend (in forms) AND the backend (in API routes).

import { z } from "zod";
// z is the main Zod object. All schema builders start with z.
// z.string() = this must be a string
// z.number() = this must be a number
// z.object({}) = this must be an object with these properties
// z.enum([]) = this must be one of these values
// ── REGISTER SCHEMA ──────────────────────────────────────────
// Rules for the sign-up form.
// REGISTER PROCESS FLOW STEP 1:
// When the user submits the signup form, this schema runs first.

export const registerSchema = z
  .object({
    name: z
      .string() // must be text
      .min(2, "Name must be at least 2 characters") // minimum 2 chars
      .max(100, "Name is too long"), // maximum 100 chars

    email: z
      .string() // must be text
      .email("Please enter a valid email address") // must look like email
      .toLowerCase(), // auto-convert to lowercase
    // toLowerCase() transforms the value before validation.
    // 'Juan@GMAIL.com' becomes 'juan@gmail.com' automatically.

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        // This regex means: must have at least ONE of each:
        // (?=.*[a-z]) = at least one lowercase letter
        // (?=.*[A-Z]) = at least one uppercase letter
        // (?=.*\d) = at least one digit (number)
        "Password must contain uppercase, lowercase, and a number",
      ),

    confirmPassword: z.string(),
    // No extra rules here — we just need it to exist.
    // The .refine() below checks that it matches password.
  })
  // .refine() adds a custom cross-field rule.
  // It runs AFTER all individual fields pass.
  // The function receives the whole object and returns true/false.
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Show the error on THIS specific field
  });

// Create a TypeScript type from the schema.
// Variables typed as RegisterInput will have: name, email, password, confirmPassword.
export type RegisterInput = z.infer<typeof registerSchema>;

// ── LOGIN SCHEMA ─────────────────────────────────────────────
// Rules for the login form.
// Simpler than register — just email format and non-empty password.

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),

  // Just check it's not empty — the actual password
  // correctness is checked against the database
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── TRANSACTION SCHEMA ───────────────────────────────────────
// Rules for adding or editing a transaction.

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    error: "Type must be income or expense",
  }),
  // z.enum() restricts to exactly these values.
  // errorMap lets you customize the error message.

  // Amount comes from the form as a STRING (form inputs return strings).
  // We use .refine() to check: is it a valid positive number?
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    // parseFloat('abc') = NaN, so isNaN catches non-numbers
    // parseFloat('-5') = -5, the > 0 check catches negatives
    { message: "Amount must be a positive number" },
  ),

  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  categoryId: z.string().optional().nullable(),
  // optional() = this field doesn't have to be present
  // nullable() = this field can be null
  // Together: can be missing, undefined, or null

  currency: z.enum(["PHP", "USD"]).default("PHP"),

  date: z.string().min(1, "Date is required"),
  // Date comes from an <input type='date'> as a string like '2025-01-15'

  notes: z.string().max(1000, "Notes are too long").optional().nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// ── BUDGET SCHEMA ────────────────────────────────────────────
export const budgetSchema = z.object({
  name: z
    .string()
    .min(1, "Budget name is required")
    .max(100, "Name is too long"),
  limitAmount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Limit must be a positive number",
    }),
  currency: z.enum(["PHP", "USD"]).default("PHP"),
  categoryId: z.string().optional().nullable(),
  // Month and year are numbers — we use .number().int() for whole numbers
  month: z.number().int().min(1, "Invalid month").max(12, "Invalid month"),
  year: z.number().int().min(2020, "Year too old").max(2100, "Year too far"),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

// ── DEBT SCHEMA ──────────────────────────────────────────────
export const debtSchema = z.object({
  personName: z.string().min(1, "Person's name is required").max(100),
  description: z.string().min(1, "Description is required").max(255),
  originalAmount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  currency: z.enum(["PHP", "USD"]).default("PHP"),
  debt_type: z.enum(["owed_to_me", "i_owe"], {
    error: "Must specify debt direction",
  }),
  dueDate: z.string().optional().nullable(),
});
export type DebtInput = z.infer<typeof debtSchema>;

// ── PROFILE SCHEMA ───────────────────────────────────────────
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  currency: z.enum(["PHP", "USD"]),
  timezone: z.string().min(1, "Timezone is required"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ── CHANGE PASSWORD SCHEMA ───────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and a number",
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
