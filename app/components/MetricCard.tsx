export default function MetricCard({
  value,
  label,
  accent,
  icon,
  variant,
  progress,
  progressLabel,
}: {
  value: string | number;
  label: string;
  accent?: string;
  icon?: string;
  variant?: "achievement" | "playtime" | "deck" | "controller";
  progress?: number;
  progressLabel?: string;
}) {
  const variantStyles: Record<
    string,
    { wrapper: string; bar: string; hoverShadow: string }
  > = {
    achievement: {
      wrapper:
        "bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-slate-950/70",
      bar: "bg-gradient-to-r from-indigo-400 to-violet-400",
      hoverShadow: "hover:shadow-[0_25px_60px_-30px_rgba(99,102,241,0.45)]",
    },
    playtime: {
      wrapper:
        "bg-gradient-to-br from-emerald-400/10 via-lime-400/10 to-slate-950/70",
      bar: "bg-gradient-to-r from-emerald-400 to-lime-400",
      hoverShadow: "hover:shadow-[0_25px_60px_-30px_rgba(16,185,129,0.35)]",
    },
    deck: {
      wrapper:
        "bg-gradient-to-br from-cyan-400/10 via-teal-400/10 to-slate-950/70",
      bar: "bg-gradient-to-r from-cyan-400 to-teal-400",
      hoverShadow: "hover:shadow-[0_25px_60px_-30px_rgba(20,184,166,0.35)]",
    },
    controller: {
      wrapper:
        "bg-gradient-to-br from-orange-400/10 via-amber-400/10 to-slate-950/70",
      bar: "bg-gradient-to-r from-orange-400 to-amber-400",
      hoverShadow: "hover:shadow-[0_25px_60px_-30px_rgba(251,146,60,0.35)]",
    },
    default: {
      wrapper: "bg-[#202429]/80",
      bar: "bg-pastel-sky",
      hoverShadow: "hover:shadow-[0_25px_60px_-30px_rgba(148,163,184,0.35)]",
    },
  };

  const styles = variant ? variantStyles[variant] : variantStyles.default;

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-white/10 p-5 shadow-xl shadow-black/10 ring-1 ring-white/5 transition-transform duration-200 ease-out hover:scale-[1.03] hover:brightness-110 ${styles.wrapper} ${styles.hoverShadow} min-h-[16rem]`}
    >
      <div className="flex items-start justify-between gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-pastel-lavender/70">
        <span className="min-w-0 inline-flex items-center gap-2 truncate">
          {icon ? <span>{icon}</span> : null}
          <span className="truncate">{label}</span>
        </span>
        {accent ? (
          <span className="max-w-full truncate text-xs text-pastel-sky">
            {accent}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-4xl font-black tabular-nums text-pastel-cream">{value}</p>
      {progress !== undefined ? (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-pastel-lavender/70">
            <span className="min-w-0 truncate">{progressLabel ?? "Progress"}</span>
            <span className="min-w-0 truncate">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${styles.bar}`}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      ) : null}
      {!progress && accent ? (
        <p className="mt-3 text-xs text-pastel-sky">{accent}</p>
      ) : null}
    </div>
  );
}
