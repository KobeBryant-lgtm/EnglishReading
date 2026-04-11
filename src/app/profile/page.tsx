"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";

type Tab = "favorites" | "history" | "info" | "security";

interface FavoriteArticle {
  id: string;
  article: {
    id: string;
    title: string;
    source: string;
    difficulty: string;
    wordCount: number;
    imageUrl: string | null;
    summary: string | null;
    publishedAt: string | null;
  };
  createdAt: string;
}

interface HistoryArticle {
  id: string;
  article: {
    id: string;
    title: string;
    source: string;
    difficulty: string;
    wordCount: number;
    imageUrl: string | null;
    summary: string | null;
  };
  lastReadAt: string;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(tabParam === "favorites" ? "favorites" : tabParam === "history" ? "history" : tabParam === "security" ? "security" : "info");
  const { user, getToken, refreshUser } = useAuth();

  const [favorites, setFavorites] = useState<FavoriteArticle[]>([]);
  const [favTotal, setFavTotal] = useState(0);
  const [favPage, setFavPage] = useState(1);

  const [history, setHistory] = useState<HistoryArticle[]>([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage] = useState(1);

  const [nickname, setNickname] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchFavorites = useCallback(async (page: number) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites);
        setFavTotal(data.total);
        setFavPage(page);
      }
    } catch {}
  }, [getToken]);

  const fetchHistory = useCallback(async (page: number) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/history?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
        setHistTotal(data.total);
        setHistPage(page);
      }
    } catch {}
  }, [getToken]);

  useEffect(() => {
    if (activeTab === "favorites") fetchFavorites(1);
    if (activeTab === "history") fetchHistory(1);
  }, [activeTab, fetchFavorites, fetchHistory]);

  useEffect(() => {
    if (user) setNickname(user.nickname || "");
  }, [user]);

  const handleUpdateProfile = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      if (res.ok) {
        setMsg({ type: "success", text: "更新成功" });
        refreshUser();
      } else {
        const data = await res.json();
        setMsg({ type: "error", text: data.error });
      }
    } catch {
      setMsg({ type: "error", text: "更新失败" });
    }
  };

  const handleChangePassword = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (res.ok) {
        setMsg({ type: "success", text: "密码修改成功" });
        setOldPassword("");
        setNewPassword("");
      } else {
        const data = await res.json();
        setMsg({ type: "error", text: data.error });
      }
    } catch {
      setMsg({ type: "error", text: "修改失败" });
    }
  };

  const handleUnfavorite = async (articleId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`/api/favorites/${articleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFavorites(favPage);
    } catch {}
  };

  const handleDeleteHistory = async (id?: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = id ? `/api/history?id=${id}` : "/api/history";
      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHistory(histPage);
    } catch {}
  };

  const displayName = user?.nickname || user?.username || "";
  const avatarChar = displayName.charAt(0).toUpperCase();

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "favorites", label: "我的收藏", icon: "⭐" },
    { key: "history", label: "阅读历史", icon: "📖" },
    { key: "info", label: "个人信息", icon: "👤" },
    { key: "security", label: "账号安全", icon: "🔒" },
  ];

  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "32px auto", padding: "0 20px", display: "flex", gap: 32 }}>
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "32px 24px", textAlign: "center", border: "1px solid var(--border-color)", marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              {avatarChar}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{displayName}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>@{user?.username}</div>
          </div>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setMsg({ type: "", text: "" }); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 24px",
                  color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 14,
                  border: "none",
                  borderBottom: "1px solid var(--border-color)",
                  background: activeTab === tab.key ? "var(--accent-light)" : "transparent",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  borderLeft: activeTab === tab.key ? "3px solid var(--accent)" : "3px solid transparent",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "favorites" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>我的收藏</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>共收藏 {favTotal} 篇文章</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {favorites.map((fav) => (
                  <div key={fav.id} style={{ display: "flex", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    <a href={`/articles/${fav.article.id}`} style={{ flex: 1, padding: "16px 20px", textDecoration: "none" }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{fav.article.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{fav.article.source} · {fav.article.wordCount}词 · 收藏于 {new Date(fav.createdAt).toLocaleDateString()}</div>
                    </a>
                    <div style={{ display: "flex", alignItems: "center", padding: 16, gap: 12 }}>
                      <button onClick={() => handleUnfavorite(fav.article.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--accent)" }}>♥</button>
                    </div>
                  </div>
                ))}
                {favorites.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>暂无收藏</div>}
              </div>
              {favTotal > 10 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                  <button disabled={favPage <= 1} onClick={() => fetchFavorites(favPage - 1)} className="btn-ghost" style={{ padding: "6px 12px" }}>上一页</button>
                  <span style={{ padding: "6px 12px", color: "var(--text-muted)", fontSize: 14 }}>{favPage}</span>
                  <button disabled={favPage >= Math.ceil(favTotal / 10)} onClick={() => fetchFavorites(favPage + 1)} className="btn-ghost" style={{ padding: "6px 12px" }}>下一页</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>阅读历史</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                共阅读 {histTotal} 篇文章
                {histTotal > 0 && (
                  <button onClick={() => { if (confirm("确定清空全部阅读历史？")) handleDeleteHistory(); }} style={{ marginLeft: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>清空全部</button>
                )}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {history.map((h) => (
                  <div key={h.id} style={{ display: "flex", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    <a href={`/articles/${h.article.id}`} style={{ flex: 1, padding: "16px 20px", textDecoration: "none" }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{h.article.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{h.article.source} · 最后阅读 {new Date(h.lastReadAt).toLocaleString()}</div>
                    </a>
                    <div style={{ display: "flex", alignItems: "center", padding: 16 }}>
                      <button onClick={() => handleDeleteHistory(h.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--text-muted)" }}>🗑</button>
                    </div>
                  </div>
                ))}
                {history.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>暂无阅读历史</div>}
              </div>
              {histTotal > 10 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                  <button disabled={histPage <= 1} onClick={() => fetchHistory(histPage - 1)} className="btn-ghost" style={{ padding: "6px 12px" }}>上一页</button>
                  <span style={{ padding: "6px 12px", color: "var(--text-muted)", fontSize: 14 }}>{histPage}</span>
                  <button disabled={histPage >= Math.ceil(histTotal / 10)} onClick={() => fetchHistory(histPage + 1)} className="btn-ghost" style={{ padding: "6px 12px" }}>下一页</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>个人信息</h2>
              {msg.text && (
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: msg.type === "success" ? "var(--accent-light)" : "var(--accent-light)", color: msg.type === "success" ? "var(--success)" : "var(--danger)", fontSize: 14 }}>
                  {msg.text}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>用户名</label>
                <input value={user?.username || ""} disabled className="input-field" style={{ width: "100%", maxWidth: 400, opacity: 0.6, padding: "12px 16px" }} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>用户名不可修改</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>昵称</label>
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="input-field" style={{ width: "100%", maxWidth: 400, padding: "12px 16px" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>注册时间</label>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{user ? new Date().toLocaleDateString() : "-"}</div>
              </div>
              <button onClick={handleUpdateProfile} className="btn-primary" style={{ padding: "10px 24px" }}>保存修改</button>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>账号安全</h2>
              {msg.text && (
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "var(--accent-light)", color: msg.type === "success" ? "var(--success)" : "var(--danger)", fontSize: 14 }}>
                  {msg.text}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>旧密码</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="input-field" style={{ width: "100%", maxWidth: 400, padding: "12px 16px" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>新密码</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少6位" className="input-field" style={{ width: "100%", maxWidth: 400, padding: "12px 16px" }} />
              </div>
              <button onClick={handleChangePassword} className="btn-primary" style={{ padding: "10px 24px" }}>修改密码</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
