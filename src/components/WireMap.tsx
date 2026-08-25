import { adjacentHoppers, rankedRoots } from "@/lib/picture";

const rootLayout: Record<string, { x: number; y: number }> = {
  "state-hardware": { x: 50, y: 12 },
  planning: { x: 28, y: 36 },
  "grid-slot": { x: 22, y: 58 },
  "firm-power": { x: 22, y: 80 },
  "acute-beds": { x: 72, y: 50 },
};

const hopperLayout: Record<string, { x: number; y: number }> = {
  "prison-places": { x: 78, y: 22 },
  returns: { x: 78, y: 78 },
};

export function WireMap() {
  const roots = rankedRoots();
  const hoppers = adjacentHoppers();

  const rootNodes = roots.map((c) => {
    const pos = rootLayout[c.slug] ?? { x: 50, y: 50 };
    return {
      slug: c.slug,
      x: pos.x,
      y: pos.y,
      label: `${String(c.order).padStart(2, "0")} ${c.shortName}`,
    };
  });

  const hopperNodes = hoppers.map((c) => {
    const pos = hopperLayout[c.slug] ?? { x: 78, y: 50 };
    return {
      slug: c.slug,
      x: pos.x,
      y: pos.y,
      label: c.shortName,
    };
  });

  return (
    <div className="rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <p className="text-xs tracking-widest text-muted uppercase">The wire</p>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Hardware sits above everything. Planning and the grid slot sit above
        energy and building. Beds are the NHS hopper. Cells and returns bind
        their own systems: adjacent, not national roots.
      </p>
      <svg
        viewBox="0 0 100 96"
        className="mt-4 h-auto w-full max-h-[420px]"
        role="img"
        aria-label="Wire diagram of Britain's binding constraints"
      >
        <line x1="50" y1="16" x2="28" y2="34" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="28" y1="40" x2="22" y2="56" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="22" y1="62" x2="22" y2="78" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="50" y1="16" x2="72" y2="48" stroke="#d5d8ce" strokeWidth="0.4" />
        <line
          x1="50"
          y1="16"
          x2="78"
          y2="22"
          stroke="#d5d8ce"
          strokeWidth="0.35"
          strokeDasharray="1 1"
        />
        <line
          x1="50"
          y1="16"
          x2="78"
          y2="78"
          stroke="#d5d8ce"
          strokeWidth="0.35"
          strokeDasharray="1 1"
        />
        {rootNodes.map((n) => (
          <a key={n.slug} href={`/constraints/${n.slug}`}>
            <rect
              x={n.x - 11}
              y={n.y - 4}
              width="22"
              height="8"
              rx="4"
              fill="#f4f6f1"
              stroke="#b8956a"
              strokeWidth="0.35"
            />
            <text
              x={n.x}
              y={n.y + 1.2}
              textAnchor="middle"
              fontSize="2.6"
              fill="#0f172a"
              fontFamily="Georgia, serif"
            >
              {n.label}
            </text>
          </a>
        ))}
        {hopperNodes.map((n) => (
          <a key={n.slug} href={`/constraints/${n.slug}`}>
            <rect
              x={n.x - 11}
              y={n.y - 4}
              width="22"
              height="8"
              rx="4"
              fill="#f4f6f1"
              stroke="#d5d8ce"
              strokeWidth="0.35"
            />
            <text
              x={n.x}
              y={n.y + 1.2}
              textAnchor="middle"
              fontSize="2.4"
              fill="#4a5560"
              fontFamily="Georgia, serif"
            >
              {n.label}
            </text>
          </a>
        ))}
      </svg>
    </div>
  );
}
