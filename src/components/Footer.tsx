import Link from "next/link";
import { SNAPSHOT_DATE } from "@/data/constraints";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm leading-relaxed text-muted">
        <p>
          Snapshot dated {SNAPSHOT_DATE}. Numbers are cited to official or
          named sources and are not blended across vintages. This is a diagnosis
          of physical slots, not a manifesto tick-list.
        </p>
        <p className="mt-3">
          Instruments labelled on each card are Progress Party policy codes.
          Surviving an argument about a slogan does not move a constraint.
        </p>
        <p className="mt-3">
          <Link href="/method" className="underline decoration-gold underline-offset-4">
            How we identify a bottleneck
          </Link>
          {" · "}
          <Link href="/sources" className="underline decoration-gold underline-offset-4">
            Sources
          </Link>
        </p>
      </div>
    </footer>
  );
}
