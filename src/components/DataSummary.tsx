'use client';

interface DataSummaryProps {
  summary: {
    totalRecords: number;
    uniqueStations: number;
    uniqueLines: number;
    dateRange: { start: string; end: string };
    weekdayCount: number;
    weekendHolidayCount: number;
  } | null;
  loading: boolean;
}

export default function DataSummary({ summary, loading }: DataSummaryProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 mb-6 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">데이터 요약</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-sm text-blue-600 dark:text-blue-400">분석 기간</div>
          <div className="text-lg font-semibold mt-1">30일</div>
          <div className="text-xs text-slate-500 mt-1">
            {formatDate(summary.dateRange.start)} ~
          </div>
          <div className="text-xs text-slate-500">
            {formatDate(summary.dateRange.end)}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-sm text-green-600 dark:text-green-400">총 역 수</div>
          <div className="text-2xl font-bold mt-1">{summary.uniqueStations}</div>
          <div className="text-xs text-slate-500">개 역</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-sm text-purple-600 dark:text-purple-400">노선 수</div>
          <div className="text-2xl font-bold mt-1">{summary.uniqueLines}</div>
          <div className="text-xs text-slate-500">개 노선</div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <div className="text-sm text-orange-600 dark:text-orange-400">평일</div>
          <div className="text-2xl font-bold mt-1">{summary.weekdayCount}</div>
          <div className="text-xs text-slate-500">일</div>
        </div>
        
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
          <div className="text-sm text-pink-600 dark:text-pink-400">주말·공휴일</div>
          <div className="text-2xl font-bold mt-1">{summary.weekendHolidayCount}</div>
          <div className="text-xs text-slate-500">일</div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">총 레코드</div>
          <div className="text-2xl font-bold mt-1">{summary.totalRecords.toLocaleString()}</div>
          <div className="text-xs text-slate-500">건</div>
        </div>
      </div>
    </div>
  );
}
