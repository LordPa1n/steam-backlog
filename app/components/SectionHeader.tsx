export default function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold uppercase tracking-[0.3em] text-pastel-peach/85">
        {title}
      </div>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-7 text-pastel-lavender/70">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
