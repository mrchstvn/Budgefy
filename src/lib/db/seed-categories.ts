// ============================================================
// DEFAULT CATEGORIES — src/db/seed-categories.ts
// ============================================================
// These are the pre-built categories every user sees when they
// sign up. They are seeded (inserted) into the database once.
// Run this file with: npx ts-node src/db/seed-categories.ts
// ============================================================

export const DEFAULT_CATEGORIES = [
  // --- EXPENSE CATEGORIES ---
  {
    name: "Food & Dining",
    icon: "utensils",
    color: "#ef4444",
    type: "expense" as const,
  },
  {
    name: "Transportation",
    icon: "car",
    color: "#f97316",
    type: "expense" as const,
  },
  {
    name: "Bills & Utilities",
    icon: "zap",
    color: "#eab308",
    type: "expense" as const,
  },
  {
    name: "Shopping",
    icon: "shopping-bag",
    color: "#a855f7",
    type: "expense" as const,
  },
  {
    name: "Health",
    icon: "heart-pulse",
    color: "#ec4899",
    type: "expense" as const,
  },
  {
    name: "Entertainment",
    icon: "tv",
    color: "#06b6d4",
    type: "expense" as const,
  },
  {
    name: "Education",
    icon: "book-open",
    color: "#3b82f6",
    type: "expense" as const,
  },
  {
    name: "Savings",
    icon: "piggy-bank",
    color: "#10b981",
    type: "expense" as const,
  },
  {
    name: "Other Expense",
    icon: "circle-minus",
    color: "#6b7280",
    type: "expense" as const,
  },

  // --- INCOME CATEGORIES ---
  {
    name: "Salary",
    icon: "briefcase",
    color: "#10b981",
    type: "income" as const,
  },
  {
    name: "Freelance",
    icon: "laptop",
    color: "#3b82f6",
    type: "income" as const,
  },
  {
    name: "Business",
    icon: "store",
    color: "#f97316",
    type: "income" as const,
  },
  {
    name: "Investment",
    icon: "trending-up",
    color: "#a855f7",
    type: "income" as const,
  },
  { name: "Gift", icon: "gift", color: "#ec4899", type: "income" as const },
  {
    name: "Other Income",
    icon: "circle-plus",
    color: "#6b7280",
    type: "income" as const,
  },
];
