import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Method",
};

export default function MethodPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">How we identify a bottleneck</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Goldratt: a system has a constraint. Optimising a non-constraint does
        not raise throughput. Most viral trackers watch queues. This picture
        watches the slot that is already full.
      </p>

      <ol className="mt-10 list-decimal space-y-6 pl-5 leading-relaxed">
        <li>
          <strong>Name the throughput</strong> you care about: megawatts
          connected, homes started, sentences served, patients completed,
          returns flown.
        </li>
        <li>
          <strong>Find the resource at about 100%</strong> while others have
          slack: grid offers, cells, beds, consents, removal agreements.
        </li>
        <li>
          <strong>Apply the doubling test.</strong> If we doubled this tomorrow,
          would that throughput rise? If not, it is a symptom.
        </li>
        <li>
          <strong>Name the instrument and the falsifier</strong> on the same
          card. A diagnosis without a causal mechanism is a slogan.
        </li>
        <li>
          <strong>Re-rank quarterly.</strong> If NESO actually connects gigawatts,
          the bind may move to nuclear labour or planning. The map is allowed
          to change. That is the learning loop.
        </li>
      </ol>

      <h2 className="mt-14 text-2xl">What this is not</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-muted">
        <li>Not a hotel map. Those already exist.</li>
        <li>Not a manifesto tick-list of the sitting government.</li>
        <li>Not a procurement dump. Contract value is not spend.</li>
        <li>
          Not a claim that Britain has one bottleneck forever. It has a handful
          of physical slots. Hardware sits above them.
        </li>
      </ul>

      <h2 className="mt-14 text-2xl">Why Progress codes are on the cards</h2>
      <p className="mt-4 leading-relaxed">
        Full Fact will not put 24 GW by 2038 next to today&apos;s nuclear
        gigawatts, because that is not a Labour pledge. Nuffield will not put a
        90% occupancy cap on a chart as policy. This site does, and it says
        what would count as failure. After a Progress government, the same URL
        scores the people who wrote the instrument.
      </p>
    </article>
  );
}
