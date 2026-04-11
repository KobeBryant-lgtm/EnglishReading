"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

type AdminTab = "dashboard" | "articles" | "users" | "crawl" | "sources";

interface Stats {
  totalArticles: number;
  todayArticles: number;
  totalUsers: number;
  todayActiveUsers: number;
}

interface AdminArticle {
  id: string;
  title: string;
  source: string;
  difficulty: string;
  wordCount: number;
  viewCount: number;
  favoriteCount: number;
  isDailyRecommend: boolean;
  publishedAt: string | null;
  crawledAt: string;
}

interface AdminUser {
  id: string;
  username: string;
  nickname: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  favoritesCount: number;
  vocabularyCount: number;
}

interface CrawlTask {
  id: string;
  sourceName: string;
  triggerType: string;
  status: string;
  articlesFetched: number;
  errorLog: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

interface AdminSource {
  id: string;
  name: string;
  nameCn: string;
  category: string | null;
  feedUrl: string | null;
  color: string;
  isActive: boolean;
  articleCount: number;
}

const Icon = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Article: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Crawl: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  Source: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Back: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  StarEmpty: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const { user, loading, getToken } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [articleTotal, setArticleTotal] = useState(0);
  const [articlePage, setArticlePage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [crawlTasks, setCrawlTasks] = useState<CrawlTask[]>([]);
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  }), [getToken]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/stats", { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } catch {}
  }, [authHeaders]);

  const fetchArticles = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/admin/articles?page=${page}&limit=10`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
        setArticleTotal(data.total);
        setArticlePage(page);
      }
    } catch {}
  }, [authHeaders]);

  const fetchUsers = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=10`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserTotal(data.total);
        setUserPage(page);
      }
    } catch {}
  }, [authHeaders]);

  const fetchCrawlTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/crawl-tasks", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCrawlTasks(data.tasks);
      }
    } catch {}
  }, [authHeaders]);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sources", { headers: authHeaders() });
      if (res.ok) setSources(await res.json());
    } catch {}
  }, [authHeaders]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    if (activeTab === "dashboard") fetchStats();
    if (activeTab === "articles") fetchArticles(1);
    if (activeTab === "users") fetchUsers(1);
    if (activeTab === "crawl") fetchCrawlTasks();
    if (activeTab === "sources") fetchSources();
  }, [activeTab, user, fetchStats, fetchArticles, fetchUsers, fetchCrawlTasks, fetchSources]);

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("确定删除此文章？")) return;
    await fetch(`/api/admin/articles?id=${id}`, { method: "DELETE", headers: authHeaders() });
    fetchArticles(articlePage);
  };

  const handleToggleRecommend = async (id: string) => {
    await fetch(`/api/admin/articles/${id}/recommend`, { method: "PUT", headers: authHeaders() });
    fetchArticles(articlePage);
  };

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    await fetch(`/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    fetchUsers(userPage);
  };

  const handleToggleUserRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`确定将角色切换为${newRole === "admin" ? "管理员" : "普通用户"}？`)) return;
    await fetch(`/api/admin/users/${id}/role`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers(userPage);
  };

  const handleTriggerCrawl = async () => {
    setTriggering(true);
    try {
      await fetch("/api/admin/crawl-tasks/trigger", { method: "POST", headers: authHeaders() });
      fetchCrawlTasks();
    } finally {
      setTriggering(false);
    }
  };

  const handleToggleSource = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/sources/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchSources();
  };

  if (loading || user?.role !== "admin") {
    return <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>;
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "仪表盘", icon: <Icon.Dashboard /> },
    { key: "articles", label: "文章管理", icon: <Icon.Article /> },
    { key: "sources", label: "来源管理", icon: <Icon.Source /> },
    { key: "crawl", label: "爬虫任务", icon: <Icon.Crawl /> },
    { key: "users", label: "用户管理", icon: <Icon.Users /> },
  ];

  const statCards = stats ? [
    { label: "今日新增", value: stats.todayArticles, sub: "篇文章" },
    { label: "文章总数", value: stats.totalArticles, sub: "篇" },
    { label: "注册用户", value: stats.totalUsers, sub: "人" },
    { label: "今日活跃", value: stats.todayActiveUsers, sub: "人" },
  ] : [];

  const sidebarBg = "#0f0f13";
  const sidebarHover = "rgba(255,255,255,0.04)";
  const sidebarActive = "rgba(192,89,43,0.12)";
  const accentColor = "#C0592B";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: sidebarBg, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            Read<span style={{ color: accentColor }}>Eng</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>Admin Console</div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          <div style={{ padding: "0 16px 8px", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Menu</div>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                margin: "2px 8px",
                borderRadius: 8,
                color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 500 : 400,
                border: "none",
                background: activeTab === tab.key ? sidebarActive : "transparent",
                cursor: "pointer",
                width: "calc(100% - 16px)",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = sidebarHover; }}
              onMouseLeave={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ opacity: activeTab === tab.key ? 1 : 0.5, display: "flex", alignItems: "center" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", margin: "2px 0",
              color: "rgba(255,255,255,0.35)", fontSize: 13, border: "none", background: "transparent",
              cursor: "pointer", width: "100%", textAlign: "left", borderRadius: 8, transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = sidebarHover}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <Icon.Back /> 返回前台
          </button>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: accentColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
              {(user?.nickname || user?.username || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{user?.nickname || user?.username}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafaf8" }}>
        <header style={{ background: "#fff", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, borderBottom: "1px solid #e8e8e5" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
            {tabs.find((t) => t.key === activeTab)?.label}
          </h2>
          <div style={{ fontSize: 12, color: "#999" }}>
            {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {activeTab === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                {statCards.map((card, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "20px 24px", border: "1px solid #e8e8e5" }}>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 10, fontWeight: 500, letterSpacing: "0.02em" }}>{card.label}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{card.value}</span>
                      <span style={{ fontSize: 12, color: "#bbb" }}>{card.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: "32px 24px", border: "1px solid #e8e8e5", textAlign: "center", color: "#ccc", fontSize: 13 }}>
                趋势图区域 — 接入图表库后展示近7/30天数据
              </div>
            </div>
          )}

          {activeTab === "articles" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#999" }}>共 {articleTotal} 篇文章</div>
                <button onClick={handleTriggerCrawl} disabled={triggering} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, border: "1px solid #e8e8e5", background: "#fff", color: "#555", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                  <Icon.Refresh /> {triggering ? "抓取中..." : "手动抓取"}
                </button>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8e8e5", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafaf8" }}>
                      {["推荐", "标题", "来源", "难度", "字数", "阅读", "收藏", "操作"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#999", borderBottom: "1px solid #e8e8e5", letterSpacing: "0.03em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #f2f2f0" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => handleToggleRecommend(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: a.isDailyRecommend ? "#f59e0b" : "#ddd", display: "flex", alignItems: "center" }}>
                            {a.isDailyRecommend ? <Icon.Star /> : <Icon.StarEmpty />}
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{a.title}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{a.source}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: "#fef3ee", color: accentColor }}>{a.difficulty}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{a.wordCount}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{a.viewCount}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{a.favoriteCount}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => handleDeleteArticle(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", display: "flex", alignItems: "center" }}>
                            <Icon.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {articleTotal > 10 && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <button disabled={articlePage <= 1} onClick={() => fetchArticles(articlePage - 1)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e8e8e5", background: "#fff", color: "#888", fontSize: 12, cursor: "pointer" }}>Prev</button>
                  <span style={{ padding: "6px 12px", color: "#999", fontSize: 12 }}>{articlePage}</span>
                  <button disabled={articlePage >= Math.ceil(articleTotal / 10)} onClick={() => fetchArticles(articlePage + 1)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e8e8e5", background: "#fff", color: "#888", fontSize: 12, cursor: "pointer" }}>Next</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>共 {userTotal} 位用户</div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8e8e5", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafaf8" }}>
                      {["用户名", "角色", "收藏", "生词", "注册时间", "状态", "操作"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#999", borderBottom: "1px solid #e8e8e5", letterSpacing: "0.03em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f2f2f0" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{u.username}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: u.role === "admin" ? "#fef3ee" : "#f5f5f3", color: u.role === "admin" ? accentColor : "#999" }}>
                            {u.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{u.favoritesCount}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{u.vocabularyCount}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: u.status === "active" ? "#22c55e" : "#ef4444", marginRight: 6, verticalAlign: "middle" }} />
                          <span style={{ fontSize: 12, color: u.status === "active" ? "#666" : "#ef4444" }}>{u.status === "active" ? "正常" : "已禁用"}</span>
                        </td>
                        <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                          <button onClick={() => handleToggleUserStatus(u.id, u.status)} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #e8e8e5", background: "#fff", color: u.status === "active" ? "#ef4444" : "#22c55e", fontSize: 11, cursor: "pointer", fontWeight: 500 }}>
                            {u.status === "active" ? "禁用" : "启用"}
                          </button>
                          <button onClick={() => handleToggleUserRole(u.id, u.role)} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #e8e8e5", background: "#fff", color: accentColor, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>
                            切换角色
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "crawl" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#999" }}>定时任务：每日 00:00 (BJT) 自动执行</div>
                <button onClick={handleTriggerCrawl} disabled={triggering} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, border: "none", background: accentColor, color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                  <Icon.Refresh /> {triggering ? "抓取中..." : "立即全部抓取"}
                </button>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8e8e5", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafaf8" }}>
                      {["执行时间", "来源", "触发", "抓取数", "状态", "操作"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#999", borderBottom: "1px solid #e8e8e5", letterSpacing: "0.03em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {crawlTasks.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid #f2f2f0" }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{new Date(t.createdAt).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{t.sourceName}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: t.triggerType === "auto" ? "#f0f9ff" : "#fef3ee", color: t.triggerType === "auto" ? "#0284c7" : accentColor }}>
                            {t.triggerType === "auto" ? "Auto" : "Manual"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 600 }}>{t.articlesFetched}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: t.status === "success" ? "#22c55e" : t.status === "failed" ? "#ef4444" : "#f59e0b", marginRight: 6, verticalAlign: "middle" }} />
                          <span style={{ fontSize: 12, color: t.status === "success" ? "#666" : t.status === "failed" ? "#ef4444" : "#f59e0b" }}>
                            {t.status === "success" ? "成功" : t.status === "failed" ? "失败" : "运行中"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                          {t.status === "failed" && (
                            <button style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #e8e8e5", background: "#fff", color: accentColor, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>重试</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "sources" && (
            <div>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8e8e5", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafaf8" }}>
                      {["来源", "分类", "文章数", "状态", "操作"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#999", borderBottom: "1px solid #e8e8e5", letterSpacing: "0.03em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f2f2f0" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>
                          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: s.color, marginRight: 8, verticalAlign: "middle" }} />
                          {s.nameCn}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{s.category || "-"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a", fontWeight: 600 }}>{s.articleCount}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: s.isActive ? "#22c55e" : "#ef4444", marginRight: 6, verticalAlign: "middle" }} />
                          <span style={{ fontSize: 12, color: s.isActive ? "#666" : "#ef4444" }}>{s.isActive ? "启用" : "已停用"}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => handleToggleSource(s.id, s.isActive)} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #e8e8e5", background: "#fff", color: s.isActive ? "#ef4444" : "#22c55e", fontSize: 11, cursor: "pointer", fontWeight: 500 }}>
                            {s.isActive ? "停用" : "启用"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
