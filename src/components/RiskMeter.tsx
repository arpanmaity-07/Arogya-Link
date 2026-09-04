import { RISK_META } from "@/lib/triage";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const meta = RISK_META[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        meta.className,
        className,
      )}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

export function RiskMeter({ score, risk }: { score: number; risk: RiskLevel }) {
  const meta = RISK_META[risk];
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <RiskBadge risk={risk} />
        <span className="text-3xl font-bold tabular-nums">{score}/100</span>
      </div>
      <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", meta.bar)}
          style={{ width: `${Math.max(6, score)}%` }}
        />
        <div className="pointer-events-none absolute inset-0 flex">
          {[25, 48, 70].map((m) => (
            <div key={m} className="absolute top-0 h-full w-px bg-background/70" style={{ left: `${m}%` }} />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>🟢 Low</span>
        <span>🟡 Moderate</span>
        <span>🔴 High</span>
        <span>🚨 Emergency</span>
      </div>
    </div>
  );
}
