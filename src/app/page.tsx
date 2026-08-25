import { ConstraintCard } from "@/components/ConstraintCard";
import { WireMap } from "@/components/WireMap";
import { SNAPSHOT_DATE, constraints } from "@/data/constraints";

export default function Home() {
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
        Test: if we doubled this tomorrow, would megawatts, homes, sentences,
        treated patients, or returns actually rise? If not, it is a symptom.
      </p>

      <div className="mt-12">
        <WireMap />
      </div>

      <h2 className="mt-16 text-2xl">Seven roots</h2>
      <p className="mt-2 max-w-2xl text-muted">
        All seven are tight. Hardware sits above the rest. The distinctive
        public clock is the grid slot: 737 GW queued, 85 GW built.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {constraints.map((c) => (
          <ConstraintCard key={c.slug} c={c} />
        ))}
      </div>
    </div>
  );
}
