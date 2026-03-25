import { cn } from "@/lib/utils";

export default function GradientShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate w-full", className)}>
      {/* FIXED BACKGROUND (covers whole page while scrolling) */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black">
        {/* Large color blobs */}
        <div className="absolute -top-[320px] left-[8%] h-[900px] w-[900px] rounded-full bg-amber-400/20 blur-[180px]" />
        <div className="absolute top-[25%] right-[0%] h-[1000px] w-[1000px] rounded-full bg-emerald-400/18 blur-[200px]" />
        <div className="absolute top-[55%] left-[-10%] h-[1100px] w-[1100px] rounded-full bg-violet-500/18 blur-[220px]" />
        <div className="absolute bottom-[-420px] right-[10%] h-[900px] w-[900px] rounded-full bg-sky-500/16 blur-[200px]" />

        {/* Vignette (dark edges like your screenshot) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_28%,rgba(0,0,0,0.88)_100%)]" />

        {/* Subtle noise */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay">
          <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22180%22 height=%22180%22 filter=%22url(%23n)%22 opacity=%220.6%22/%3E%3C/svg%3E')]" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative min-h-dvh w-full">{children}</div>
    </div>
  );
}
