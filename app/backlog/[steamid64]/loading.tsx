export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#31373d_0%,#24282d_35%,#181b1f_70%,#111315_100%)] px-4 py-8 text-pastel-cream sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-5 w-32 rounded-full bg-pastel-lavender/10" />
        <div className="mt-5 h-12 w-72 rounded-2xl bg-pastel-lavender/10" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 rounded-3xl border border-white/10 bg-[#202429]/55"
            />
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="h-72 rounded-3xl border border-white/10 bg-[#202429]/55" />
          <div className="h-72 rounded-3xl border border-white/10 bg-[#202429]/55" />
        </div>
      </div>
    </main>
  );
}
