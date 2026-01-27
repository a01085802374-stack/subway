import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "지하철 이용객 분석 서비스",
  description: "대한민국 지하철역 이용객 데이터를 최근 30일 기준으로 분석하는 웹 서비스",
  keywords: ["지하철", "이용객", "분석", "서울", "메트로", "승하차"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <span>🚇</span>
              <span>지하철 이용객 분석</span>
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              최근 30일 기준 평일/주말·공휴일 평균 분석
            </p>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto py-4 sm:py-8 px-3 sm:px-6">
          {children}
        </main>
        <footer className="bg-slate-100 dark:bg-slate-900 py-3 sm:py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-slate-500">
            © 2026 지하철 이용객 분석 서비스
          </div>
        </footer>
      </body>
    </html>
  );
}
