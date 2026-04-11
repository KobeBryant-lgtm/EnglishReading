"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("请填写用户名和密码");
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 70px)", padding: "40px 20px" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 440, border: "1px solid var(--border-color)", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, textAlign: "center", color: "var(--text-primary)" }}>欢迎回来</h1>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>登录你的 ReadEng 账号</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="input-field"
                style={{ width: "100%", padding: "12px 16px", fontSize: 15 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="input-field"
                style={{ width: "100%", padding: "12px 16px", fontSize: 15 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, fontSize: 13 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
                记住我
              </label>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "var(--accent-light)", color: "var(--accent)", fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 600, borderRadius: 8 }}
            >
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)", marginTop: 24 }}>
            还没有账号？<a href="/register" style={{ color: "var(--accent)", fontWeight: 500 }}>立即注册</a>
          </div>
        </div>
      </div>
    </main>
  );
}
