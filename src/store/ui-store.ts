// ============================================================
// UI STORE — src/store/ui-store.ts
// ============================================================
// Zustand is a simple way to share state between components
// without passing props through many layers.
//
// Think of it like a shared whiteboard — any component can
// read from it or write to it, and all other components that
// depend on it update automatically.
//
// This store manages UI state like:
// - Is the balance hidden (private mode)?
// - Which modal is currently open?
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware"; // Saves state to localStorage

// TypeScript interface = the SHAPE of this store.
// Every field must match its declared type.
interface UIState {
  // isBalanceHidden: When true, show "****" instead of the actual amount
  isBalanceHidden: boolean;
  toggleBalanceVisibility: () => void;

  // activeModal: Which modal/dialog is currently open (null = none)
  activeModal: "addTransaction" | "addWallet" | "addBudget" | "addDebt" | null;
  openModal: (modal: UIState["activeModal"]) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  // persist() saves the state to localStorage so it survives page refreshes
  persist(
    (set) => ({
      // Default state
      isBalanceHidden: false,
      activeModal: null,

      // Toggle: if hidden → show, if showing → hide
      toggleBalanceVisibility: () =>
        set((state) => ({ isBalanceHidden: !state.isBalanceHidden })),

      // Open a specific modal
      openModal: (modal) => set({ activeModal: modal }),

      // Close whatever modal is open
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: "budgefy-ui", // The localStorage key to save under
      // Only persist the balance visibility preference, not the modal state
      partialize: (state) => ({ isBalanceHidden: state.isBalanceHidden }),
    },
  ),
);

//-----------------------------------OLD CODE--------------------------------------------------//

// // src/store/index.ts
// // Global state management using Zustand.
// // Think of this file as a shared whiteboard that any component
// // in the app can read from or write to.

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// // persist: saves the state to localStorage automatically.
// // Even after refreshing the page, the saved preferences are restored.

// // ── USER PREFERENCES STORE ───────────────────────────────────
// // Stores settings that the user has chosen.

// // TypeScript interface = the SHAPE of this store.
// // Every field must match its declared type.
// interface UserPreferencesState {
//     currency: 'PHP' | 'USD'; // Can ONLY be one of these two strings
//     timezone: string;
//     sidebarOpen: boolean;

//     // Actions = functions that UPDATE the state
//     setCurrency: (currency: 'PHP' | 'USD') => void;
//     setTimezone: (timezone: string) => void;
//     toggleSidebar: () => void;
//     setSidebarOpen: (open: boolean) => void;
// }

// // create<Type>() builds the store.
// // useUserPreferences is a HOOK — a function starting with 'use'
// // that you call inside React components to access the store.
// export const useUserPreferences = create<UserPreferencesState>()(
//     persist(
//         // 'set' is the function that updates state.
//         // Calling set({ currency: 'USD' }) updates currency to 'USD'
//         // and triggers a re-render in all components using this store.
//         (set) => ({

//             // ── DEFAULT VALUES ──────────────────────────────────────
//             // These are the starting values before the user changes anything.
//             currency: 'PHP',
//             timezone: 'Asia/Manila',
//             sidebarOpen: true,

//             // ── ACTIONS ─────────────────────────────────────────────
//             // setCurrency('USD') → changes currency to 'USD' everywhere
//             setCurrency: (currency) => set({ currency }),

//             // setTimezone('America/New_York') → changes timezone
//             setTimezone: (timezone) => set({ timezone }),

//             // toggleSidebar() → flips sidebar between open and closed
//             toggleSidebar: () => set((state) => ({
//                 sidebarOpen: !state.sidebarOpen,
//                 // set() can receive a function that gets the CURRENT state.
//                 // !state.sidebarOpen flips: true → false, false → true
//             })),

//             setSidebarOpen: (open) => set({ sidebarOpen: open }),
//         }),
//         {
//             // The key used to save this store in localStorage.
//             // Open browser DevTools → Application → Local Storage
//             // You'll see 'budget-app-preferences' with the JSON value.
//             name: 'budget-app-preferences',
//         }
//     )
// );

// // ── DASHBOARD FILTER STORE ───────────────────────────────────
// // Tracks which month/year the user is viewing on dashboard pages.
// // Not persisted — resets when page refreshes (intentional).
// interface DashboardFilterState {
//     selectedMonth: number;
//     selectedYear: number;
//     transactionType: 'all' | 'income' | 'expense';

//     setMonth: (month: number) => void;
//     setYear: (year: number) => void;
//     setTransactionType: (type: 'all' | 'income' | 'expense') => void;
//     resetToCurrentMonth: () => void;
// }

// export const useDashboardFilters = create<DashboardFilterState>((set) => {
//     const now = new Date();
//     return {
//         selectedMonth: now.getMonth() + 1, // 1-12
//         selectedYear: now.getFullYear(),
//         transactionType: 'all',

//         setMonth: (month) => set({ selectedMonth: month }),
//         setYear: (year) => set({ selectedYear: year }),
//         setTransactionType: (type) => set({ transactionType: type }),
//         resetToCurrentMonth: () => {
//             const now = new Date();
//             set({ selectedMonth: now.getMonth() + 1, selectedYear: now.getFullYear() });
//         },
//     };
// });
