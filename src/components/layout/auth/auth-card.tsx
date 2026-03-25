import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border",
        "bg-card/55 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.16),transparent_50%)] opacity-70 dark:opacity-90" />
      <CardContent className="relative p-8 md:p-10">{children}</CardContent>
    </Card>
  );
}
