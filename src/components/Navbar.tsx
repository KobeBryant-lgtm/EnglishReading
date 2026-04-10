"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", String(newMode));
  };

  return (
    <nav
      style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)" }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: "var(--text-primary)", fontFamily: "var(--serif)" }}
            >
              ReadEng
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            <NavLink href="/">文章</NavLink>
            <NavLink href="/vocabulary">生词本</NavLink>
            <NavLink href="/sources">来源</NavLink>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md transition-colors text-sm"
              style={{ color: "var(--text-muted)" }}
              title={darkMode ? "亮色模式" : "暗色模式"}
            >
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileMenuOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <><path d="M3 12h18M3 6h18M3 18h18" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-0.5" style={{ borderTop: "1px solid var(--border-color)" }}>
            <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>文章</MobileNavLink>
            <MobileNavLink href="/vocabulary" onClick={() => setMobileMenuOpen(false)}>生词本</MobileNavLink>
            <MobileNavLink href="/sources" onClick={() => setMobileMenuOpen(false)}>来源</MobileNavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-sm no-underline transition-colors"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-2 rounded-md text-sm no-underline block"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </Link>
  );
}
