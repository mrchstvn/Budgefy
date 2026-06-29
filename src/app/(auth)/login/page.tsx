// "use client" means this component runs in the browser, not on the server.
// We need this because we're using form state, onClick handlers, etc.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import GithubIcon from "@/components/icons/githubicon";
import GoogleIcon from "@/components/icons/googleicon";
import { toast } from "sonner";

export default function LoginPage() {
  // useRouter lets us navigate programmatically (e.g., after login, go to /dashboard)
  const router = useRouter();

  // useSearchParams reads the URL query string — we use it to get ?callbackUrl=
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  // Local state for the error message and loading spinner
  const [isLoading, setIsLoading] = useState(false);

  // useForm gives us everything we need to manage the form.
  // resolver: zodResolver(loginSchema) connects Zod validation to the form.
  const {
    register, // connect inputs to the form
    handleSubmit, // wraps your submit function with validation
    formState: { errors }, // contains validation errors
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // This runs when the form is submitted AND all validation passes
  async function onSubmit(data: LoginInput) {
    setIsLoading(true);

    // signIn() from next-auth handles the actual login request.
    // provider: "credentials" = email + password
    // redirect: false = don't redirect automatically, let us handle it
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Map our custom error codes to human-readable messages
        if (result.error === "TOO_MANY_ATTEMPTS") {
          toast.error("Too many login attempts. Please wait 15 minutes.");
        } else {
          toast.error("Invalid email or password. Please try again.");
        }
        return;
      }
      // Login successful — go to the page they originally wanted (or dashboard)
      router.push(callbackUrl);
      // refresh server components with the new session
      router.refresh();
      // show success message after redirecting (optional)
      toast.success("Logged in successfully!");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuthLogin(provider: "google" | "github") {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
      // next-auth will handle the redirect, so we don't need to do anything else here
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-h-screen bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
        Login to your account
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Start tracking your money today
      </p>
      {/* ── Google Sign-In Button ── */}
      <button
        onClick={() => handleOAuthLogin("google")}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 mb-4 hover:cursor-pointer "
      >
        {/* Google's logo */}
        <GoogleIcon className="size-6" />
        Continue with Google
      </button>

      {/* ── Github Sign-In Button ── */}
      <button
        onClick={() => handleOAuthLogin("github")}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 mb-4 hover:cursor-pointer "
      >
        {/* Github's logo */}
        <GithubIcon className="size-6" />
        Continue with Github
      </button>

      {/* Divider line with "or" text */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">or</span>
        </div>
      </div>

      {/* ── Email/Password Form ── */}
      {/* handleSubmit wraps our onSubmit — it runs Zod validation first */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
        {/* Email Field */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </Label>
          <Input
            {...register("email")}
            type="email"
            placeholder="juan@email.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </Label>
          <Input
            {...register("password")}
            type="password"
            placeholder="Min. 8 characters with a number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 hover:cursor-pointer "
        >
          {/* Show different text while loading */}
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {/* Link to register page */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-brand-700 font-medium underline hover:text-brand-900 "
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

// {/* <Card className="w-full max-w-md">
//                 <CardHeader className="space-y-1">
//                     <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
//                     <CardDescription>Sign in to your budget app</CardDescription>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                     {/* Show error message if login failed */}
//                     {error && (
//                         <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
//                             {error}
//                         </div>
//                     )}

//                     {/* OAuth buttons */}
//                     <div className="grid grid-cols-2 gap-3">
//                         <Button
//                             variant="outline"
//                             onClick={() => signIn("google", { callbackUrl })}
//                             disabled={isLoading}
//                         >
//                             {/* Simple Google "G" text logo */}
//                             <span className="mr-2 font-bold text-blue-500">G</span>
//                             Google
//                         </Button>
//                         <Button
//                             variant="outline"
//                             onClick={() => signIn("github", { callbackUrl })}
//                             disabled={isLoading}
//                         >
//                             <span className="mr-2">⌥</span>
//                             GitHub
//                         </Button>
//                     </div>

//                     {/* Divider */}
//                     <div className="relative">
//                         <div className="absolute inset-0 flex items-center">
//                             <span className="w-full border-t" />
//                         </div>
//                         <div className="relative flex justify-center text-xs uppercase">
//                             <span className="bg-background px-2 text-muted-foreground">
//                                 Or continue with email
//                             </span>
//                         </div>
//                     </div>

//                     {/* Email + password form */}
//                     {/* handleSubmit(onSubmit) = validate first, then call onSubmit */}
//                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="email">Email</Label>
//                             {/* register("email") connects this input to react-hook-form */}
//                             <Input
//                                 id="email"
//                                 type="email"
//                                 placeholder="you@example.com"
//                                 {...register("email")}
//                                 disabled={isLoading}
//                             />
//                             {/* Show validation error if email is invalid */}
//                             {errors.email && (
//                                 <p className="text-sm text-destructive">{errors.email.message}</p>
//                             )}
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="password">Password</Label>
//                             <Input
//                                 id="password"
//                                 type="password"
//                                 placeholder="••••••••"
//                                 {...register("password")}
//                                 disabled={isLoading}
//                             />
//                             {errors.password && (
//                                 <p className="text-sm text-destructive">{errors.password.message}</p>
//                             )}
//                         </div>

//                         <Button type="submit" className="w-full" disabled={isLoading}>
//                             {isLoading ? "Signing in..." : "Sign in"}
//                         </Button>
//                     </form>
//                 </CardContent>

//                 <CardFooter>
//                     <p className="text-sm text-muted-foreground text-center w-full">
//                         Don't have an account?{" "}
//                         <Link href="/register" className="text-primary hover:underline font-medium">
//                             Create one
//                         </Link>
//                     </p>
//                 </CardFooter>
//             </Card> */}
