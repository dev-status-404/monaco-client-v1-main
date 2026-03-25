"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalSignUp } from "../../hooks";
import { useState } from "react";
import { getErrorMessage, getSuccessMessage } from "@/lib/extractor/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function SignUpForm() {
  const signupMutation = useLocalSignUp();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLocalSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const firstName = form.elements.namedItem("firstName") as HTMLInputElement;
    const lastName = form.elements.namedItem("lastName") as HTMLInputElement;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const password = form.elements.namedItem("password") as HTMLInputElement;

    const values = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    };

    signupMutation.mutateAsync(values, {
      onSuccess: async (data) => {
        let redirectTo = data.redirect || "/auth/signin";
        form.reset();
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
  return (
    <form onSubmit={handleLocalSignUp} className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input name="firstName" id="first" placeholder="John" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input name="lastName" id="last" placeholder="Doe" required />
        </div>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            name="password"
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            required
            className="pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={signupMutation.isPending}
        className="w-full flex items-center bg-emerald-400 text-black hover:bg-emerald-300"
      >
        Create Account{" "}
        {signupMutation.isPending && <Loader2 className="ml-2 animate-spin" />}
      </Button>

      <p className="text-center text-sm text-muted-foreground dark:text-white/70">
        Already have an account?{" "}
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
