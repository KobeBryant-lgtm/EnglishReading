import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export const metadata: Metadata = {
  title: "ReadEng - 考研英语外刊精读",
  description: "每日自动抓取考研英语阅读来源外刊，提供点击查词、逐句翻译、生词本等功能，助力考研英语阅读提分",
  keywords: ["考研英语", "英语阅读", "外刊精读", "卫报", "经济学人", "英语学习"],
  authors: [{ name: "ReadEng" }],
  creator: "ReadEng",
  publisher: "ReadEng",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "ReadEng",
    title: "ReadEng - 考研英语外刊精读",
    description: "每日自动抓取考研英语阅读来源外刊，提供点击查词、逐句翻译、生词本等功能",
  },
  twitter: {
    card: "summary",
    title: "ReadEng - 考研英语外刊精读",
    description: "每日自动抓取考研英语阅读来源外刊，提供点击查词、逐句翻译、生词本等功能",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.dictionaryapi.dev" />
        <link rel="dns-prefetch" href="https://api-free.deepl.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('darkMode');
                  if (theme === 'true' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
