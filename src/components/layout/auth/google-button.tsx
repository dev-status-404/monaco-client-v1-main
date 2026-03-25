"use client";

import { Button } from "@/components/ui/button";

export default function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      className="w-full justify-center gap-3 bg-secondary/70 hover:bg-secondary"
    >
      <GoogleIcon />
      Continue with Google
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.18 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.274 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.274 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"/>
      <path fill="#4CAF50" d="M24 44c5.08 0 9.773-1.955 13.303-5.132l-6.144-5.197C29.152 35.091 26.715 36 24 36c-5.156 0-9.61-3.317-11.283-7.946l-6.52 5.024C9.504 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.207-2.231 4.083-4.144 5.317l.003-.002 6.144 5.197C36.871 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
