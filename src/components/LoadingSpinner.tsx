export default function LoadingSpinner() {
  return (
    <div className="ghibli-card p-8 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* 구름 배경 */}
        <div className="w-16 h-16 rounded-full bg-ghibli-beige border-4 border-ghibli-sand flex items-center justify-center">
          <span className="text-2xl animate-bounce">🚃</span>
        </div>
        {/* 회전 링 */}
        <div className="w-16 h-16 rounded-full border-4 border-ghibli-leaf border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="text-center">
        <p className="text-ghibli-earth font-medium">데이터를 불러오는 중...</p>
        <p className="text-xs text-ghibli-brown mt-1">🌿 잠시만 기다려 주세요 🌿</p>
      </div>
    </div>
  );
}
