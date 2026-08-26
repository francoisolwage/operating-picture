import Link from "next/link";
import { ConstraintCard } from "@/components/ConstraintCard";
import { WireMap } from "@/components/WireMap";
import { CONSIDERED } from "@/data/candidates";
import { SNAPSHOT_DATE } from "@/data/constraints";
import { adjacentHoppers, rankedRoots } from "@/lib/picture";

export default function Home() {
  const roots = rankedRoots();
  const hoppers = adjacentHoppers();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">
        Snapshot {SNAPSHOT_DATE}
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-6xl">
        A mill is waiting on a plug. A nurse is waiting on a bed.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed">
        The kit is in the yard in Port Talbot. The offer date is 2035. Tuesday&apos;s
        patient was ready to go home and still has the bay. Five slots in
        Britain sit at 100%. Homes, power, and treated patients only move when
        those slots crack.
      </p>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Waiting lists, boats, and hotel maps are the queue you can already
        share. This picture watches the constraint that produces them.
      </p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line p-4">
          <dt className="text-xs tracking-widest text-muted uppercase">
            Names on the grid
          </dt>
          <dd className="mt-2 font-[family-name:var(--font-source)] text-3xl">
            737 GW
          </dd>
          <p className="mt-1 text-sm text-muted">85 GW actually built</p>
        </div>
        <div className="rounded-2xl border border-line p-4">
          <dt className="text-xs tracking-widest text-muted uppercase">
            Factory power
          </dt>
          <dd className="mt-2 font-[family-name:var(--font-source)] text-3xl">
            2× France
          </dd>
          <p className="mt-1 text-sm text-muted">
            A mill competing on the bill, not the wage
          </p>
        </div>
        <div className="rounded-2xl border border-line p-4">
          <dt className="text-xs tracking-widest text-muted uppercase">
            Ready to leave, still in
          </dt>
          <dd className="mt-2 font-[family-name:var(--font-source)] text-3xl">
            13,750
          </dd>
          <p className="mt-1 text-sm text-muted">People a day occupying a bed</p>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/play"
          className="inline-flex rounded-full bg-ink px-5 py-3 text-sm text-paper"
        >
          Play the console
        </Link>
        <a
          href="#roots"
          className="inline-flex rounded-full border border-line px-5 py-3 text-sm"
        >
          The five slots
        </a>
      </div>

      <div className="mt-14">
        <WireMap />
      </div>

      <h2 id="roots" className="mt-16 scroll-mt-8 text-2xl">
        Five roots
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        Each card is a person and a full slot. Hardware sits above the rest.
        Planning and the grid bind building and power. Cheap firm power is
        what you do with it: steel, servers, heat, the night shift. Beds bind
        NHS flow.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {roots.map((c) => (
          <ConstraintCard key={c.slug} c={c} badge={`National ${String(c.order).padStart(2, "0")}`} />
        ))}
      </div>

      <h2 className="mt-16 text-2xl">Adjacent hoppers</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Real physical slots in their own systems. They did not pass the
        national doubling test against homes, megawatts, and treated patients,
        so they are not in the top five. Ranked out on {SNAPSHOT_DATE}.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {hoppers.map((c) => (
          <ConstraintCard key={c.slug} c={c} badge="Hopper" />
        ))}
      </div>

      <h2 className="mt-16 text-2xl">Considered, not ranked</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Each was scored. None replaced a root. The map is allowed to change
        next quarter if the numbers move.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {CONSIDERED.map((item) => (
          <li key={item.slug} className="py-5">
            <p className="text-xl">{item.name}</p>
            <p className="mt-2 max-w-3xl leading-relaxed text-muted">
              {item.verdict}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
