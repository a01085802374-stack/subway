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
    <div className="ghibli-card p-5 mb-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-ghibli-charcoal flex items-center gap-2">
        <span className="text-xl">🎯</span>
        조회 조건 선택
      </h2>
      
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
        {/* 날짜 유형 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-ghibli-earth mb-2">
            날짜 유형
          </label>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onDayTypeChange('weekday')}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                dayType === 'weekday'
                  ? 'bg-ghibli-sky text-white shadow-md'
                  : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
              }`}
            >
              🌿 평일
            </button>
            <button
              onClick={() => onDayTypeChange('weekend_holiday')}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                dayType === 'weekend_holiday'
                  ? 'bg-ghibli-sky text-white shadow-md'
                  : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
              }`}
            >
              <span className="hidden sm:inline">🌅 주말·공휴일</span>
              <span className="sm:hidden">🌅 주말</span>
            </button>
            <button
              onClick={() => onDayTypeChange('overall')}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                dayType === 'overall'
                  ? 'bg-ghibli-sky text-white shadow-md'
                  : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
              }`}
            >
              🌊 전체
            </button>
          </div>
        </div>

        {/* 지표 유형 + 랭킹 유형 (모바일에서는 한 줄에) */}
        <div className="flex gap-4 sm:contents">
          {/* 지표 유형 */}
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-ghibli-earth mb-2">
              지표 유형
            </label>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => onMetricTypeChange('boarding')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  metricType === 'boarding'
                    ? 'bg-ghibli-forest text-white shadow-md'
                    : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
                }`}
              >
                🚶 승차
              </button>
              <button
                onClick={() => onMetricTypeChange('alighting')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  metricType === 'alighting'
                    ? 'bg-ghibli-forest text-white shadow-md'
                    : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
                }`}
              >
                🚶‍♂️ 하차
              </button>
            </div>
          </div>

          {/* 랭킹 유형 */}
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-ghibli-earth mb-2">
              랭킹 유형
            </label>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => onRankTypeChange('top')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  rankType === 'top'
                    ? 'bg-ghibli-terracotta text-white shadow-md'
                    : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
                }`}
              >
                ⬆️ TOP
              </button>
              <button
                onClick={() => onRankTypeChange('bottom')}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  rankType === 'bottom'
                    ? 'bg-ghibli-terracotta text-white shadow-md'
                    : 'bg-ghibli-beige text-ghibli-brown hover:bg-ghibli-sand border border-ghibli-sand'
                }`}
              >
                ⬇️ BOTTOM
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 현재 선택 표시 (모바일) */}
      <div className="mt-3 pt-3 border-t border-ghibli-sand sm:hidden">
        <div className="text-xs text-ghibli-earth text-center">
          현재: <span className="font-medium text-ghibli-charcoal">
            {dayType === 'weekday' ? '🌿 평일' : dayType === 'weekend_holiday' ? '🌅 주말·공휴일' : '🌊 전체'} 
            {' '}{metricType === 'boarding' ? '🚶 승차' : '🚶‍♂️ 하차'} 
            {' '}{rankType === 'top' ? '⬆️ TOP' : '⬇️ BOTTOM'} 30
          </span>
        </div>
      </div>
    </div>
  );
}
