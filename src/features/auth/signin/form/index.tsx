"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalSignIn } from "../../hooks";
import { toast } from "sonner";
import { getErrorMessage, getSuccessMessage } from "@/lib/extractor/auth";
import { useState } from "react";
import { loginSuccess } from "@/redux/slices/user";
import { setAuthCookies } from "@/lib/cookies";
import { useDispatch } from "react-redux";
import { persistor } from "@/redux/store";
import { useRouter } from "next/navigation";

/**
 * SignInForm is a form component that allows users to sign in with their email and password.
 * It uses the useLocalSignIn hook to handle the signin process.
 * If the signin is successful, it will reset the form and log the user data to the console.
 * If there is an error, it will log the error to the console.
 */
export default function SignInForm() {
  const signInMutation = useLocalSignIn();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLocalSignin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const password = form.elements.namedItem("password") as HTMLInputElement;

    const values = {
      email: email.value,
      password: password.value,
    };

    signInMutation.mutateAsync(values, {
      onSuccess: async (data) => {
        const user = data.data;
        const jwt = data.jwt || "none";
        let redirectTo = data.redirect || "/auth/signin";
        console.log(data);

        form.reset();
        setAuthCookies({ accessToken: jwt });
        // Dispatch user data to Redux
        dispatch(loginSuccess(user));
        // Flush persistor to ensure state is saved before navigation
        await persistor.flush();
        // Small delay to ensure Redux state is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Navigate to dashboard
        const successMessage = getSuccessMessage(data.message);
        toast.success(successMessage);
        router.replace(redirectTo);
      },
      onError: (error) => {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      },
    });
  };

  const handleGoogleSignin = () => {};

  return (
    <form
      action="/auth/signin"
      onSubmit={handleLocalSignin}
      className="mt-6 space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-sm text-emerald-600 hover:underline dark:text-emerald-300"
            href="/auth/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <Input id="password" type="password" placeholder="••••••••" required />
      </div>

      <Button
        disabled={signInMutation.isPending}
        className="w-full bg-emerald-400 text-black hover:bg-emerald-300"
      >
        Sign In
      </Button>

      <p className="text-center text-sm text-muted-foreground dark:text-white/70">
        Don’t have an account?{" "}
        <Link
          className="text-amber-500 hover:underline dark:text-amber-300"
          href="/auth/signup"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
