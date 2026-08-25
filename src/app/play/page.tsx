import type { Metadata } from "next";
import { Cabinet } from "@/components/game/Cabinet";

export const metadata: Metadata = {
  title: "The cabinet",
  description:
    "One parliament. Play instruments on the binding slot. Slogans fill the queue.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <Cabinet />
    </div>
  );
}
