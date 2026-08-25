const nodes: { slug: string; x: number; y: number; label: string }[] = [
  { slug: "state-hardware", x: 50, y: 10, label: "01 Hardware" },
  { slug: "planning", x: 28, y: 32, label: "03 Planning" },
  { slug: "grid-slot", x: 22, y: 54, label: "02 Grid slot" },
  { slug: "firm-power", x: 22, y: 76, label: "04 Firm power" },
  { slug: "prison-places", x: 72, y: 40, label: "05 Cells" },
  { slug: "acute-beds", x: 72, y: 62, label: "06 Beds" },
  { slug: "returns", x: 72, y: 84, label: "07 Returns" },
];

export function WireMap() {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <p className="text-xs tracking-widest text-muted uppercase">The wire</p>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Hardware sits above everything. Planning and the grid slot sit above
        energy and building. Cells, beds, and returns are their own hoppers.
      </p>
      <svg
        viewBox="0 0 100 96"
        className="mt-4 h-auto w-full max-h-[420px]"
        role="img"
        aria-label="Wire diagram of Britain's binding constraints"
      >
        <line x1="50" y1="14" x2="28" y2="30" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="28" y1="34" x2="22" y2="52" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="22" y1="58" x2="22" y2="74" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="50" y1="14" x2="72" y2="38" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="50" y1="14" x2="72" y2="60" stroke="#d5d8ce" strokeWidth="0.4" />
        <line x1="50" y1="14" x2="72" y2="82" stroke="#d5d8ce" strokeWidth="0.4" />
        {nodes.map((n) => (
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
      </svg>
    </div>
  );
}
