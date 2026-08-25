import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/StatusPill";
import { constraints, getConstraint } from "@/data/constraints";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return constraints.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = getConstraint(slug);
  if (!c) return {};
  return {
    title: c.name,
    description: c.slot,
  };
}

export default async function ConstraintPage({ params }: Props) {
  const { slug } = await params;
  const c = getConstraint(slug);
  if (!c) notFound();

  const others = constraints.filter((x) => x.slug !== c.slug);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">
        Constraint {String(c.order).padStart(2, "0")}
      </p>
      <div className="mt-3">
        <StatusPill status={c.status} />
      </div>
      <h1 className="mt-5 text-4xl sm:text-5xl">{c.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{c.slot}</p>

      <section className="mt-10 rounded-2xl border border-line p-6">
        <p className="text-xs tracking-widest text-muted uppercase">The number</p>
        <p className="mt-3 font-[family-name:var(--font-source)] text-5xl tracking-tight">
          {c.hero.value}
        </p>
        <p className="mt-2 text-lg">{c.hero.label}</p>
        {c.hero.detail ? (
          <p className="mt-3 leading-relaxed text-muted">{c.hero.detail}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          As of {c.hero.asOf}.{" "}
          <a
            href={c.hero.href}
            className="underline decoration-gold underline-offset-4"
          >
            {c.hero.source}
          </a>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Why this is the slot</h2>
        <p className="mt-3 text-sm text-muted">Throughput: {c.throughput}</p>
        <p className="mt-2 italic text-muted">{c.test}</p>
        <div className="mt-6 space-y-4 leading-relaxed">
          {c.why.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Watch these</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {c.metrics.map((m) => (
            <li key={m.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
              <div>
                <p className="font-semibold">{m.label}</p>
                {m.detail ? (
                  <p className="text-sm text-muted">{m.detail}</p>
                ) : null}
                <p className="text-xs text-muted">
                  {m.asOf} ·{" "}
                  <a href={m.href} className="underline decoration-gold underline-offset-4">
                    {m.source}
                  </a>
                </p>
              </div>
              <p className="font-[family-name:var(--font-source)] text-2xl">
                {m.value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line p-5">
          <h2 className="text-xl">What people track instead</h2>
          <p className="mt-3 font-semibold">{c.symptom.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {c.symptom.whyWrong}
          </p>
        </div>
        <div className="rounded-2xl border border-line p-5">
          <h2 className="text-xl">What doubling it unlocks</h2>
          <p className="mt-3 leading-relaxed">{c.unlocks}</p>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-gold/40 bg-gold/5 p-6">
        <p className="text-xs tracking-widest text-gold uppercase">
          Instrument {c.instrument.code}
        </p>
        <p className="mt-3 leading-relaxed">{c.instrument.text}</p>
        <h2 className="mt-8 text-xl">What would count as failure</h2>
        <p className="mt-3 leading-relaxed">{c.falsifier}</p>
        <p className="mt-4 text-sm text-muted">
          Surviving a row about the slogan does not move this slot. Progress
          Party policy codes are named so the claim can be failed.
        </p>
      </section>

      <p className="mt-12 leading-relaxed text-muted">{c.story}</p>

      <nav className="mt-16 border-t border-line pt-8">
        <p className="text-xs tracking-widest text-muted uppercase">
          Other constraints
        </p>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/constraints/${o.slug}`}
                className="underline decoration-gold underline-offset-4"
              >
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
