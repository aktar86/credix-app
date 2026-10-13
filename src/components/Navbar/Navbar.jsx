"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/cgpa", label: "CGPA" },
  { href: "/test", label: "Test" },
  // { href: "/grade-scale", label: "Grade scale" },
  // { href: "/history", label: "History" },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold text-ink"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white"
          >
            C
          </span>
          CredixApp
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-[15px] font-medium transition ${
                  active
                    ? "bg-primary-tint text-primary-dark"
                    : "text-slate hover:bg-primary-tint hover:text-primary-dark"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
