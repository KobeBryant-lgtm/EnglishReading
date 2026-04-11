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
  avatarUrl: string | null;
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
  description: string | null;
  articleCount: number;
}

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
    if (!confirm(`确定将角色切换为 ${newRole === "admin" ? "管理员" : "普通用户"}？`)) return;
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
    return <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>加载中...</div>;
  }

  const tabs: { key: AdminTab; label: string; icon: string; section?: string }[] = [
    { key: "dashboard", label: "仪表盘", icon: "📊", section: "概览" },
    { key: "articles", label: "文章管理", icon: "📄", section: "内容" },
    { key: "sources", label: "来源管理", icon: "🌐", section: "内容" },
    { key: "crawl", label: "爬虫任务", icon: "🤖", section: "内容" },
    { key: "users", label: "用户管理", icon: "👥", section: "用户" },
  ];

  const statCards = stats ? [
    { label: "今日新增文章", value: stats.todayArticles },
    { label: "文章总数", value: stats.totalArticles },
    { label: "注册用户", value: stats.totalUsers },
    { label: "今日活跃", value: stats.todayActiveUsers },
  ] : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, background: "#1a1a2e", color: "#fff", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 24px 20px", fontSize: 20, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          Read<span style={{ color: "var(--accent)" }}>Eng</span> Admin
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: 14,
                border: "none",
                background: activeTab === tab.key ? "rgba(192,89,43,0.15)" : "transparent",
                borderLeft: activeTab === tab.key ? "3px solid var(--accent)" : "3px solid transparent",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <div style={{ padding: "20px 24px 8px", fontSize: 11, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>其他</div>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 24px",
              color: "rgba(255,255,255,0.6)", fontSize: 14, border: "none", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            ↩ 返回前台
          </button>
        </nav>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          ReadEng Admin v2.0
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ background: "var(--bg-card)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
            {tabs.find((t) => t.key === activeTab)?.label}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14, color: "var(--text-muted)" }}>
            <span>{new Date().toLocaleDateString("zh-CN")}</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>
              {(user?.nickname || user?.username || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto", background: "var(--bg-secondary)" }}>
          {activeTab === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
                {statCards.map((card, i) => (
                  <div key={i} style={{ background: "var(--bg-card)", borderRadius: 12, padding: 24, border: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{card.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)" }}>{card.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: 24, border: "1px solid var(--border-color)", textAlign: "center", color: "var(--text-muted)" }}>
                📈 趋势图区域 — 接入 ECharts / Chart.js 后展示近7/30天数据
              </div>
            </div>
          )}

          {activeTab === "articles" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <input type="text" placeholder="搜索文章标题..." className="input-field" style={{ width: 280 }} />
                <button onClick={handleTriggerCrawl} disabled={triggering} className="btn-ghost" style={{ padding: "10px 20px" }}>
                  {triggering ? "抓取中..." : "🔄 手动抓取"}
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>推荐</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>标题</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>来源</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>难度</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>字数</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>阅读量</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>收藏</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <button onClick={() => handleToggleRecommend(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: a.isDailyRecommend ? "#f59e0b" : "var(--text-muted)", fontSize: 16 }}>
                            {a.isDailyRecommend ? "★" : "☆"}
                          </button>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-primary)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{a.source}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: "var(--accent-light)", color: "var(--accent)" }}>{a.difficulty}</span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{a.wordCount}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{a.viewCount}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{a.favoriteCount}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <button onClick={() => handleDeleteArticle(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 13, padding: "4px 10px", borderRadius: 6 }}>删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {articleTotal > 10 && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                  <button disabled={articlePage <= 1} onClick={() => fetchArticles(articlePage - 1)} className="btn-ghost" style={{ padding: "6px 12px" }}>上一页</button>
                  <span style={{ padding: "6px 12px", color: "var(--text-muted)", fontSize: 14 }}>{articlePage}</span>
                  <button disabled={articlePage >= Math.ceil(articleTotal / 10)} onClick={() => fetchArticles(articlePage + 1)} className="btn-ghost" style={{ padding: "6px 12px" }}>下一页</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>用户名</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>角色</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>收藏</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>生词</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>注册时间</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>状态</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-primary)" }}>{u.username}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: u.role === "admin" ? "var(--accent-light)" : "var(--bg-secondary)", color: u.role === "admin" ? "var(--accent)" : "var(--text-muted)" }}>
                            {u.role === "admin" ? "管理员" : "用户"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{u.favoritesCount}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{u.vocabularyCount}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: u.status === "active" ? "#f0fdf4" : "#fef2f2", color: u.status === "active" ? "#16a34a" : "#dc2626" }}>
                            {u.status === "active" ? "正常" : "已禁用"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, display: "flex", gap: 8 }}>
                          <button onClick={() => handleToggleUserStatus(u.id, u.status)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 10px", borderRadius: 6, color: u.status === "active" ? "var(--danger)" : "var(--success)" }}>
                            {u.status === "active" ? "禁用" : "启用"}
                          </button>
                          <button onClick={() => handleToggleUserRole(u.id, u.role)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 10px", borderRadius: 6, color: "var(--accent)" }}>
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
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>⏰ 定时任务：每日 00:00 (BJT) 自动执行</span>
                <button onClick={handleTriggerCrawl} disabled={triggering} className="btn-primary" style={{ padding: "10px 20px" }}>
                  {triggering ? "抓取中..." : "🚀 立即全部抓取"}
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>执行时间</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>来源</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>触发</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>抓取数</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>状态</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crawlTasks.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{new Date(t.createdAt).toLocaleString()}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{t.sourceName}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{t.triggerType === "auto" ? "自动" : "手动"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{t.articlesFetched}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: t.status === "success" ? "#f0fdf4" : t.status === "failed" ? "#fef2f2" : "#fffbeb", color: t.status === "success" ? "#16a34a" : t.status === "failed" ? "#dc2626" : "#d97706" }}>
                            {t.status === "success" ? "成功" : t.status === "failed" ? "失败" : "运行中"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, display: "flex", gap: 8 }}>
                          {t.errorLog && (
                            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 10px", borderRadius: 6, color: "var(--text-muted)" }}>日志</button>
                          )}
                          {t.status === "failed" && (
                            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 10px", borderRadius: 6, color: "var(--accent)" }}>重试</button>
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
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>来源</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>分类</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>文章数</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>状态</th>
                      <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", borderBottom: "1px solid var(--border-color)" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{s.nameCn}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{s.category || "-"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{s.articleCount}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.isActive ? "#f0fdf4" : "#fef2f2", color: s.isActive ? "#16a34a" : "#dc2626" }}>
                            {s.isActive ? "启用" : "已停用"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>
                          <button onClick={() => handleToggleSource(s.id, s.isActive)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "4px 10px", borderRadius: 6, color: s.isActive ? "var(--danger)" : "var(--success)" }}>
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
