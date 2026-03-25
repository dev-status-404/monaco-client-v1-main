import { cn } from "@/lib/utils";

export default function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center items-center min-h-screen", className)}>
      {children}
    </div>
  );
}
