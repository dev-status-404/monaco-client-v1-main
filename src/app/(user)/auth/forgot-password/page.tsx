"use client";
import AuthShell from "@/components/layout/auth/auth-shell";
import AuthCard from "@/components/layout/auth/auth-card";
import ForgotPasswordForm from "@/features/auth/forgot-password/form";

export default function ForgotPassword() {
  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm text-muted-foreground dark:text-white/70">
          Account Recovery
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Forgot Password
        </h1>
        <p className="mt-3 text-sm text-muted-foreground dark:text-white/70">
          Enter your email address and we will send you a OTP to reset your
          password
        </p>

        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  );
}
