import type { Metadata } from "next";
import { Campaign } from "@/components/game/Campaign";

export const metadata: Metadata = {
  title: "Break the Slot",
  description:
    "Arcade boss rush: smash Britain's five binding constraints with the right instrument. Symptoms bounce.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
      <Campaign />
    </div>
  );
}
