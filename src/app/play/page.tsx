import type { Metadata } from "next";
import { Builder } from "@/components/game/Builder";

export const metadata: Metadata = {
  title: "Parliament console",
  description:
    "Build Britain from the operating console. One screen. The bind stalls the yard.",
};

export default function PlayPage() {
  return <Builder />;
}
