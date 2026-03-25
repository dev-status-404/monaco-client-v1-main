"use client";
import AuthShell from "@/components/layout/auth/auth-shell";
import AuthCard from "@/components/layout/auth/auth-card";
import ResetPasswordForm from "@/features/auth/reset-password/form";

export default function Page() {
  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm text-muted-foreground dark:text-white/70">
          Password & Security
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Reset Password
        </h1>
        <p className="mt-3 text-sm text-muted-foreground dark:text-white/70">
         Enter Password and OTP you received via email.
        </p>

        <ResetPasswordForm />
      </AuthCard>
    </AuthShell>
  );
}
