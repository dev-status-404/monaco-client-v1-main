"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getErrorMessage, getSuccessMessage } from "@/lib/extractor/auth";
import { useResetPassword } from "../../hooks";

/**
 * ResetPasswordForm
 * Resets password using OTP + new password.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const otp = form.elements.namedItem("otp") as HTMLInputElement;
    const password = form.elements.namedItem("password") as HTMLInputElement;

    const values = {
      otp: otp.value,
      password: password.value,
    };

    resetPasswordMutation.mutate(values, {
      onSuccess: (data: any) => {
        console.log(data);
        
        form.reset();
        const successMessage = getSuccessMessage(data?.message);
        toast.success(successMessage || "Password updated successfully.");
        // const redirectTo = data?.redirect || "/auth/signin";
        // router.replace(redirectTo);
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage || "Failed to reset password.");
      },
    });
  };

  return (
    <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">OTP</Label>
        <Input
          name="otp"
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="Enter OTP"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          name="password"
          id="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        disabled={resetPasswordMutation.isPending}
        className="w-full bg-emerald-400 text-black hover:bg-emerald-300"
      >
        {resetPasswordMutation.isPending ? "Updating..." : "Reset Password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground dark:text-white/70">
        Back to{" "}
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
