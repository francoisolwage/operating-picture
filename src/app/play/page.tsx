import type { Metadata } from "next";
import { Campaign } from "@/components/game/Campaign";

export const metadata: Metadata = {
  title: "One parliament",
  description:
    "Five people wait on five slots. Stamp the gold plate with the instrument. Symptoms bounce.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
      <Campaign />
    </div>
  );
}
