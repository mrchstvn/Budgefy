// src/app/budget/page.tsx
// The budget page — runs on the SERVER.
"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function BudgetPage() {
  return (
    <div>
      Hello from budget
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}
