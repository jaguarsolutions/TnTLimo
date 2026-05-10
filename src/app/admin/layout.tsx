import Link from "next/link";
import type { ReactNode } from "react";
import { getTenant } from "@/lib/tenant";

const tenant = getTenant();

export const metadata = {
  title: `Operator dashboard · ${tenant.shortName}`,
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-stone-900 text-stone-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Operator dashboard
            </p>
            <h1 className="font-display text-lg font-semibold">{tenant.name}</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/bookings" className="hover:text-amber-300 transition-colors">
              Bookings
            </Link>
            <a
              href={tenant.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-stone-300 hover:text-amber-300 transition-colors"
            >
              ↗ Public site
            </a>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">{children}</main>
    </div>
  );
}
