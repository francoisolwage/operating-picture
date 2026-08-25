import Link from "next/link";
import type { Constraint } from "@/data/constraints";
import { StatusPill } from "./StatusPill";

export function ConstraintCard({
  c,
  badge,
}: {
  c: Constraint;
  badge?: string;
}) {
  return (
    <Link
      href={`/constraints/${c.slug}`}
      className="group flex flex-col rounded-2xl border border-line bg-paper p-5 transition hover:border-gold"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs tracking-widest text-muted uppercase">
          {badge ?? String(c.order).padStart(2, "0")}
        </p>
        <StatusPill status={c.status} />
      </div>
      <h2 className="mt-4 text-2xl">{c.name}</h2>
      <p className="mt-2 font-[family-name:var(--font-source)] text-3xl tracking-tight">
        {c.hero.value}
      </p>
      <p className="mt-1 text-sm text-muted">{c.hero.label}</p>
      <p className="mt-4 text-sm leading-relaxed text-ink/90">{c.slot}</p>
      <p className="mt-auto pt-5 text-sm text-gold group-hover:underline">
        Open the slot
      </p>
    </Link>
  );
}
