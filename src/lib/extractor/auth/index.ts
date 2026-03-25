// Helper to extract error message (plain text)
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("user-already-verified"))
      return "Your account is already verified.";

    if (message.includes("user-not-found"))
      return "No account found with this email.";

    if (message.includes("invalid-credentials"))
      return "Invalid email or password.";

    if (message.includes("user-blocked"))
      return "Your account has been blocked. Please contact support.";

    if (message.includes("account-not-verified"))
      return "Your account is not verified yet.";

    if (message.includes("invalid-password"))
      return "Incorrect password. Please try again.";

    if (message.includes("user-already-exists"))
      return "An account with this email already exists.";

    if (message.includes("invalid-otp"))
      return "Invalid or expired OTP.";

    if (message.includes("auth/weak-password"))
      return "Password must be at least 6 characters long.";

    if (message.includes("auth/too-many-requests"))
      return "Too many attempts. Please try again later.";

    if (message.includes("google-signin-failed"))
      return "Google sign-in failed. Please try again.";

    return "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

// Helper to extract success message (plain text)
function getSuccessMessage(message: unknown): string {
  if (typeof message === "string") {
    if (message.includes("password-reset-email-sent"))
      return "Password reset email has been sent.";

    if (message.includes("account-created"))
      return "Your account has been created successfully.";

    if (message.includes("signin-successful"))
      return "Signed in successfully.";

    if (message.includes("signed-out-successfully"))
      return "Signed out successfully.";

    if (message.includes("password-updated"))
      return "Your password has been updated successfully.";

    if (message.includes("google-signin-success"))
      return "Signed in with Google successfully.";

    return "Operation completed successfully.";
  }

  return "Operation completed successfully.";
}

export { getErrorMessage, getSuccessMessage };
