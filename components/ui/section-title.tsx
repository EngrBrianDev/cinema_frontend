export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-headline text-3xl font-extrabold uppercase text-primary">{title}</h2>
      {subtitle ? <p className="font-body-md text-sm text-outline">{subtitle}</p> : null}
    </div>
  );
}
