import type { ConstraintStatus } from "@/data/constraints";

const copy: Record<ConstraintStatus, string> = {
  tight: "Slot tight",
  moving: "Moving",
  easing: "Easing",
};

export function StatusPill({ status }: { status: ConstraintStatus }) {
  const colour =
    status === "tight"
      ? "text-tight border-tight/30"
      : status === "moving"
        ? "text-moving border-moving/30"
        : "text-easing border-easing/30";
  return (
    <span
      className={`pill inline-block border px-3 py-0.5 text-xs tracking-wide ${colour}`}
    >
      {copy[status]}
    </span>
  );
}
