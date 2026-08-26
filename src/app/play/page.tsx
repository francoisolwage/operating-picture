import type { Metadata } from "next";
import { Builder } from "@/components/game/Builder";

export const metadata: Metadata = {
  title: "Parliament console",
  description:
    "One-screen parliament console. Stamp the bind, start works, clock the year. The bind stalls the yard.",
};

export default function PlayPage() {
  return <Builder />;
}
