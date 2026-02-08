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
      <body className="antialiased min-h-screen flex flex-col ghibli-pattern">
        {/* 지브리 스타일 헤더 */}
        <header className="relative overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-r from-ghibli-forest via-ghibli-leaf to-ghibli-moss" />
          {/* 구름 장식 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-[10%] w-20 h-8 bg-white rounded-full blur-sm" />
            <div className="absolute top-4 left-[15%] w-16 h-6 bg-white rounded-full blur-sm" />
            <div className="absolute top-1 right-[20%] w-24 h-10 bg-white rounded-full blur-sm" />
            <div className="absolute top-3 right-[25%] w-14 h-5 bg-white rounded-full blur-sm" />
          </div>
          {/* 헤더 내용 */}
          <div className="relative py-4 sm:py-6 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-3 text-white drop-shadow-md">
                <span className="text-2xl sm:text-4xl">🚃</span>
                <span>지하철 이용객 분석</span>
              </h1>
              <p className="text-ghibli-mint text-xs sm:text-sm mt-1 ml-11 sm:ml-14">
                평일/주말·공휴일 평균 분석 서비스
              </p>
            </div>
          </div>
          {/* 하단 웨이브 */}
          <svg className="absolute bottom-0 left-0 w-full h-4" viewBox="0 0 1200 20" preserveAspectRatio="none">
            <path 
              d="M0,20 Q300,0 600,10 T1200,20 L1200,20 L0,20 Z" 
              fill="#FDF8F0"
            />
          </svg>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:py-10 px-3 sm:px-6">
          {children}
        </main>

        {/* 지브리 스타일 푸터 */}
        <footer className="relative overflow-hidden bg-gradient-to-t from-ghibli-beige to-ghibli-cream">
          {/* 상단 웨이브 */}
          <svg className="absolute top-0 left-0 w-full h-4" viewBox="0 0 1200 20" preserveAspectRatio="none">
            <path 
              d="M0,0 Q300,20 600,10 T1200,0 L1200,0 L0,0 Z" 
              fill="#FDF8F0"
            />
          </svg>
          {/* 풀밭 장식 */}
          <div className="absolute bottom-0 left-0 w-full h-8 opacity-30">
            <div className="absolute bottom-0 left-[5%] w-1 h-6 bg-ghibli-forest rounded-full transform -rotate-6" />
            <div className="absolute bottom-0 left-[7%] w-1 h-8 bg-ghibli-leaf rounded-full" />
            <div className="absolute bottom-0 left-[9%] w-1 h-5 bg-ghibli-moss rounded-full transform rotate-6" />
            <div className="absolute bottom-0 right-[5%] w-1 h-7 bg-ghibli-forest rounded-full transform rotate-3" />
            <div className="absolute bottom-0 right-[7%] w-1 h-6 bg-ghibli-leaf rounded-full transform -rotate-3" />
            <div className="absolute bottom-0 right-[9%] w-1 h-8 bg-ghibli-moss rounded-full" />
          </div>
          {/* 푸터 내용 */}
          <div className="relative py-6 sm:py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-ghibli-earth text-xs sm:text-sm flex items-center justify-center gap-2">
                <span>🌿</span>
                <span>© 2026 지하철 이용객 분석 서비스</span>
                <span>🌿</span>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
