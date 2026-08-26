import type { Metadata } from "next";
import { Builder } from "@/components/game/Builder";

export const metadata: Metadata = {
  title: "Parliament builder",
  description:
    "Build Britain for one parliament. Projects stall on the bind. Restart the mill, raise homes, free a hospital bay.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <Builder />
    </div>
  );
}
