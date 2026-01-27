'use client';

import { DayType, MetricType, RankType } from '@/lib/types';

interface CategorySelectorProps {
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
  onDayTypeChange: (value: DayType) => void;
  onMetricTypeChange: (value: MetricType) => void;
  onRankTypeChange: (value: RankType) => void;
}

export default function CategorySelector({
  dayType,
  metricType,
  rankType,
  onDayTypeChange,
  onMetricTypeChange,
  onRankTypeChange,
}: CategorySelectorProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">조회 조건 선택</h2>
      
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
        {/* 날짜 유형 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            날짜 유형
          </label>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onDayTypeChange('weekday')}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                dayType === 'weekday'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              평일
            </button>
            <button
              onClick={() => onDayTypeChange('weekend_holiday')}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                dayType === 'weekend_holiday'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="hidden sm:inline">주말·공휴일</span>
              <span className="sm:hidden">주말</span>
            </button>
            <button
              onClick={() => onDayTypeChange('overall')}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                dayType === 'overall'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              전체
            </button>
          </div>
        </div>

        {/* 지표 유형 + 랭킹 유형 (모바일에서는 한 줄에) */}
        <div className="flex gap-4 sm:contents">
          {/* 지표 유형 */}
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              지표 유형
            </label>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => onMetricTypeChange('boarding')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  metricType === 'boarding'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                승차
              </button>
              <button
                onClick={() => onMetricTypeChange('alighting')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  metricType === 'alighting'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                하차
              </button>
            </div>
          </div>

          {/* 랭킹 유형 */}
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              랭킹 유형
            </label>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => onRankTypeChange('top')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  rankType === 'top'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                TOP
              </button>
              <button
                onClick={() => onRankTypeChange('bottom')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  rankType === 'bottom'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                BOTTOM
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 현재 선택 표시 (모바일) */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 sm:hidden">
        <div className="text-xs text-slate-500 text-center">
          현재: <span className="font-medium text-slate-700 dark:text-slate-300">
            {dayType === 'weekday' ? '평일' : dayType === 'weekend_holiday' ? '주말·공휴일' : '전체'} 
            {' '}{metricType === 'boarding' ? '승차' : '하차'} 
            {' '}{rankType === 'top' ? 'TOP' : 'BOTTOM'} 30
          </span>
        </div>
      </div>
    </div>
  );
}
