import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-h-screen">
      <div className="flex flex-col gap-4 p-10 text-center">
        <div>
          <h1 className="text-3xl font-bold md:text-5xl">
            Know exactly where your money goes
          </h1>
          <p className="text-sm my-2 md:text-lg">
            Track income, expenses, budgets, and debts in one place
          </p>
        </div>

        <div className="flex flex-row gap-4 justify-center">
          <Link href="/register">
            <Button
              variant="default"
              size="lg"
              className="cursor-pointer px-4 m-0 flex items-center justify-center w-full"
            >
              Create free account
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer px-4 m-0 flex items-center justify-center w-full"
            >
              Log in to your account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
