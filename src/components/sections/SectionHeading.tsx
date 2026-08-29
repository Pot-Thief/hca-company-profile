export function SectionHeading({
  id,
  label,
  headline,
}: {
  id: string;
  label: string;
  headline: string;
}) {
  const text = headline || label || id;
  return (
    <div className="mb-[var(--space-block)] md:grid md:grid-cols-[8rem_1fr] md:gap-[var(--space-gutter)]">
      {label ? (
        <p className="font-mono text-label uppercase tracking-label text-graphite">{label}</p>
      ) : null}
      <h2 className="type-display text-h2 leading-heading text-balance">{text}</h2>
    </div>
  );
}
