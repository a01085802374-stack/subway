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
      <h2 className="text-lg font-semibold mb-4">조회 조건 선택</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 날짜 유형 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            날짜 유형
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onDayTypeChange('weekday')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dayType === 'weekday'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              평일
            </button>
            <button
              onClick={() => onDayTypeChange('weekend_holiday')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dayType === 'weekend_holiday'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              주말·공휴일
            </button>
            <button
              onClick={() => onDayTypeChange('overall')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dayType === 'overall'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              전체
            </button>
          </div>
        </div>

        {/* 지표 유형 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            지표 유형
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onMetricTypeChange('boarding')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                metricType === 'boarding'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              승차
            </button>
            <button
              onClick={() => onMetricTypeChange('alighting')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                metricType === 'alighting'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              하차
            </button>
          </div>
        </div>

        {/* 랭킹 유형 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            랭킹 유형
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onRankTypeChange('top')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                rankType === 'top'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              TOP 30
            </button>
            <button
              onClick={() => onRankTypeChange('bottom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                rankType === 'bottom'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              BOTTOM 30
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
