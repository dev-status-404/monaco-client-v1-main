import { cn } from "@/lib/utils";

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5", className)}>
      {eyebrow ? (
        <p className="text-xs font-medium tracking-wider text-emerald-300/90">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-white/60">{subtitle}</p>
      ) : null}
    </div>
  );
}
