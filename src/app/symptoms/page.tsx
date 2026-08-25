import type { Metadata } from "next";
import Link from "next/link";
import { getConstraint, symptoms } from "@/data/constraints";

export const metadata: Metadata = {
  title: "Symptoms",
};

export default function SymptomsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">Symptoms are not slots</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Other sites already live on these numbers. They are real. They are
        downstream. We keep them here so the homepage does not.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {symptoms.map((s) => {
          const c = getConstraint(s.behind);
          return (
            <li key={s.name} className="py-5">
              <p className="text-xl">{s.name}</p>
              <p className="mt-1 text-muted">{s.is}</p>
              {c ? (
                <p className="mt-2 text-sm">
                  Behind it:{" "}
                  <Link
                    href={`/constraints/${c.slug}`}
                    className="underline decoration-gold underline-offset-4"
                  >
                    {c.name}
                  </Link>
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
