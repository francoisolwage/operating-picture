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
        Britain is not short of plans. It is short of slots.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        A system has a bottleneck. Throughput is set by the resource that is
        already at 100%. Waiting lists, boats, and hotel maps are inventory.
        This picture watches the constraint that produces them.
      </p>
      <p className="mt-4 max-w-2xl leading-relaxed">
        Test: if we doubled this tomorrow, would megawatts, homes, or treated
        patients actually rise? If not, it is a symptom. Ranked quarterly.
        Five national roots. Two adjacent hoppers.
      </p>

      <p className="mt-8">
        <Link
          href="/play"
          className="inline-flex rounded-full bg-ink px-5 py-3 text-sm text-paper"
        >
          Play the parliament
        </Link>
      </p>

      <div className="mt-12">
        <WireMap />
      </div>

      <h2 className="mt-16 text-2xl">Five roots</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Ranked by tightness, national scope, and how many other slots sit
        underneath. Hardware is the meta-constraint. Planning and the grid slot
        bind building and power. Firm power binds the industrial bill. Beds
        bind NHS flow.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        Each was scored. None replaced a root. The method is allowed to change
        the map next quarter if the numbers move.
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
