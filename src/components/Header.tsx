import Link from "next/link";

const links = [
  { href: "/", label: "Map" },
  { href: "/play", label: "Play" },
  { href: "/method", label: "Method" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/sources", label: "Sources" },
];

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-source)] text-lg tracking-tight">
            The Operating Picture
          </span>
          <span className="hidden text-sm text-muted sm:inline">
            Britain&apos;s binding constraints
          </span>
        </Link>
        <nav className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
