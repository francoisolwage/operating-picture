import type { Metadata } from "next";
import { constraints } from "@/data/constraints";

export const metadata: Metadata = {
  title: "Sources",
};

export default function SourcesPage() {
  const rows = constraints.flatMap((c) =>
    [c.hero, ...c.metrics].map((m) => ({
      constraint: c.name,
      ...m,
    })),
  );

  return (
    <article className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">Sources</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Every figure on this site carries a vintage. We do not blend 2013 IPA
        confidence with 2026 prison counts into a single story. Official
        statistics beat commentary. Progress policy books are cited as
        instruments, not as data.
      </p>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs tracking-widest text-muted uppercase">
              <th className="py-3 pr-4">Constraint</th>
              <th className="py-3 pr-4">Metric</th>
              <th className="py-3 pr-4">Value</th>
              <th className="py-3 pr-4">As of</th>
              <th className="py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.constraint}-${r.label}-${r.asOf}`} className="border-b border-line/70">
                <td className="py-3 pr-4">{r.constraint}</td>
                <td className="py-3 pr-4">{r.label}</td>
                <td className="py-3 pr-4 font-[family-name:var(--font-source)]">
                  {r.value}
                </td>
                <td className="py-3 pr-4 text-muted">{r.asOf}</td>
                <td className="py-3">
                  <a
                    href={r.href}
                    className="underline decoration-gold underline-offset-4"
                  >
                    {r.source}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
