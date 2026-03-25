"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getErrorMessage, getSuccessMessage } from "@/lib/extractor/auth";
import { useForgotPassword } from "../../hooks";

/**
 * ForgotPasswordForm
 * Sends reset password email / OTP request.
 * On success: redirects user to reset-password page.
 */
export default function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();

  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement;

    forgotPasswordMutation.mutate(
      { email: email.value },
      {
        onSuccess: (data) => {
            console.log(data);
            
          form.reset();
          const successMessage = getSuccessMessage(data?.message);
          toast.success(
            successMessage || "Reset instructions sent to your email.",
          );
          // if your backend sends redirect, use it. else default:
          const redirectTo = data?.redirect || "/auth/reset-password";
          window.location.href = redirectTo;
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          toast.error(errorMessage || "Failed to send reset email.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          id="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <Button
        disabled={forgotPasswordMutation.isPending}
        className="w-full bg-emerald-400 text-black hover:bg-emerald-300"
      >
        {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground dark:text-white/70">
        Remember your password?{" "}
        <Link
          className="text-amber-500 hover:underline dark:text-amber-300"
          href="/auth/signin"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
