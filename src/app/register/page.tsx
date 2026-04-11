"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const fetchCaptcha = async () => {
    try {
      const res = await fetch("/api/auth/captcha");
      const data = await res.json();
      setCaptchaId(data.captchaId);
      setCaptchaQuestion(data.question);
    } catch {}
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !captchaAnswer) {
      setError("请填写所有必填项");
      return;
    }
    if (username.length < 4 || username.length > 20) {
      setError("用户名需4-20位");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("用户名仅限字母/数字/下划线");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (password !== password2) {
      setError("两次密码不一致");
      return;
    }

    setLoading(true);
    try {
      await register(username, password, captchaId, captchaAnswer);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "注册失败");
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 70px)", padding: "40px 20px" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 440, border: "1px solid var(--border-color)", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, textAlign: "center", color: "var(--text-primary)" }}>创建账号</h1>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>注册后即可使用收藏、生词本等个性化功能</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="4-20位，字母/数字/下划线"
                className="input-field"
                style={{ width: "100%", padding: "12px 16px", fontSize: 15 }}
              />
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>用户名注册后不可修改</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位"
                className="input-field"
                style={{ width: "100%", padding: "12px 16px", fontSize: 15 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>确认密码</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="再次输入密码"
                className="input-field"
                style={{ width: "100%", padding: "12px 16px", fontSize: 15 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>验证码</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="输入计算结果"
                  className="input-field"
                  style={{ flex: 1, padding: "12px 16px", fontSize: 15 }}
                />
                <div
                  onClick={fetchCaptcha}
                  style={{
                    padding: "10px 20px",
                    background: "var(--bg-secondary)",
                    borderRadius: 8,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: 2,
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {captchaQuestion || "..."}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>点击验证码可刷新</div>
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
              {loading ? "注册中..." : "注 册"}
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)", marginTop: 24 }}>
            已有账号？<a href="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>立即登录</a>
          </div>
        </div>
      </div>
    </main>
  );
}
