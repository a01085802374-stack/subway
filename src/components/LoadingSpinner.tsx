export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="ml-4 text-slate-600 dark:text-slate-400">데이터를 불러오는 중...</span>
    </div>
  );
}
