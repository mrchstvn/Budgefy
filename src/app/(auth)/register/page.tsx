"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import GoogleIcon from "@/components/icons/googleicon";
import GithubIcon from "@/components/icons/githubicon";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);

    try {
      // Call our register API route we built in Step 9
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle both string errors and field-specific errors
        console.log(
          typeof result.error === "string"
            ? result.error
            : "Registration failed. Please check your details.",
        );
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Registration failed. Please check your details.",
        );
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully.");

      // // Registration successful — automatically sign them in so they don't
      // // have to log in manually right after creating an account
      // await signIn("credentials", {
      //   email: data.email,
      //   password: data.password,
      //   redirect: false,
      // });

      router.push("/login");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  }

  // Handler for Google sign-in button
  async function handleGoogleSignIn() {
    setIsLoading(true);
    // signIn("google") triggers the Google OAuth flow.
    // callbackUrl = where to go after Google confirms the identity.
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  // Handler for Github sign-in button
  async function handleGithubSignIn() {
    setIsLoading(true);
    // signIn("github") triggers the Github OAuth flow.
    // callbackUrl = where to go after Github confirms the identity.
    await signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
        Create account
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Start tracking your money today
      </p>

      {/* ── Google Sign-In Button ── */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 mb-4 hover:cursor-pointer "
      >
        {/* Google's logo */}
        <GoogleIcon className="size-6" />
        Continue with Google
      </button>

      {/* ── Github Sign-In Button ── */}
      <button
        onClick={handleGithubSignIn}
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </Label>
          {/* register("name") connects this input to React Hook Form */}
          <Input
            {...register("name")}
            type="text"
            placeholder="Juan dela Cruz"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {/* Show error message if validation fails */}
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

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

        {/* Confirm Password Field */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </Label>
          <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="Repeat your password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
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

      {/* Link to login page */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-700 font-medium underline hover:text-brand-900 "
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
{
  /* <Card className="w-full max-w-md">
                  <CardHeader className="space-y-1">
                      <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                      <CardDescription>Start tracking your money today</CardDescription>
                  </CardHeader>
  
                  <CardContent className="space-y-4">
                      {error && (
                          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                              {error}
                          </div>
                      )}
  
                      <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                              <span className="mr-2 font-bold text-blue-500">G</span> Google
                          </Button>
                          <Button variant="outline" onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
                              <span className="mr-2">⌥</span> GitHub
                          </Button>
                      </div>
  
                      <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                  Or register with email
                              </span>
                          </div>
                      </div>
  
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="name">Full name</Label>
                              <Input id="name" placeholder="Juan dela Cruz" {...register("name")} disabled={isLoading} />
                              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                          </div>
  
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} disabled={isLoading} />
                              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                          </div>
  
                          <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input id="password" type="password" placeholder="••••••••" {...register("password")} disabled={isLoading} />
                              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                          </div>
  
                          <Button type="submit" className="w-full" disabled={isLoading}>
                              {isLoading ? "Creating account..." : "Create account"}
                          </Button>
                      </form>
                  </CardContent>
  
                  <CardFooter>
                      <p className="text-sm text-muted-foreground text-center w-full">
                          Already have an account?{" "}
                          <Link href="/login" className="text-primary hover:underline font-medium">
                              Sign in
                          </Link>
                      </p>
                  </CardFooter>
              </Card> */
}
