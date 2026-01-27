import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "지하철 이용객 분석 서비스",
  description: "대한민국 지하철역 이용객 데이터를 분석하는 웹 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen">
        <header className="bg-blue-600 text-white py-4 px-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">🚇 지하철 이용객 분석 서비스</h1>
            <p className="text-blue-100 text-sm mt-1">최근 30일 기준 평일/주말·공휴일 평균 분석</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-8 px-6">
          {children}
        </main>
        <footer className="bg-slate-100 dark:bg-slate-900 py-4 px-6 mt-auto">
          <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
            © 2026 지하철 이용객 분석 서비스
          </div>
        </footer>
      </body>
    </html>
  );
}
