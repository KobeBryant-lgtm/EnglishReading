"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("darkMode", String(newMode));
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const displayName = user?.nickname || user?.username || "";
  const avatarChar = displayName.charAt(0).toUpperCase();

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

          <div className="flex items-center gap-2">
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

            {!loading && (
              <>
                {user ? (
                  <div ref={dropdownRef} style={{ position: "relative" }}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                      }}
                    >
                      {avatarChar}
                    </button>

                    {dropdownOpen && (
                      <div style={{
                        position: "absolute",
                        right: 0,
                        top: 40,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 10,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                        minWidth: 200,
                        overflow: "hidden",
                        zIndex: 200,
                      }}>
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{displayName}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{user.username}</div>
                        </div>
                        <DropdownItem href="/profile" onClick={() => setDropdownOpen(false)}>个人中心</DropdownItem>
                        <DropdownItem href="/profile?tab=favorites" onClick={() => setDropdownOpen(false)}>我的收藏</DropdownItem>
                        <DropdownItem href="/profile?tab=history" onClick={() => setDropdownOpen(false)}>阅读历史</DropdownItem>
                        {user.role === "admin" && (
                          <DropdownItem href="/admin" onClick={() => setDropdownOpen(false)}>后台管理</DropdownItem>
                        )}
                        <button
                          onClick={handleLogout}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            color: "var(--accent)",
                            fontSize: 14,
                            border: "none",
                            borderTop: "1px solid var(--border-color)",
                            background: "none",
                            cursor: "pointer",
                            width: "100%",
                            textAlign: "left",
                          }}
                        >
                          退出登录
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      href="/login"
                      className="btn-ghost"
                      style={{ padding: "6px 16px", fontSize: 13, minHeight: "auto" }}
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary"
                      style={{ padding: "6px 16px", fontSize: 13, minHeight: "auto" }}
                    >
                      注册
                    </Link>
                  </div>
                )}
              </>
            )}

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
            {!user && !loading && (
              <>
                <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)}>登录</MobileNavLink>
                <MobileNavLink href="/register" onClick={() => setMobileMenuOpen(false)}>注册</MobileNavLink>
              </>
            )}
            {user && (
              <>
                <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>个人中心</MobileNavLink>
                {user.role === "admin" && (
                  <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)}>后台管理</MobileNavLink>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 12px",
                    fontSize: 14,
                    color: "var(--accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  退出登录
                </button>
              </>
            )}
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

function DropdownItem({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        color: "var(--text-secondary)",
        fontSize: 14,
        textDecoration: "none",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}
