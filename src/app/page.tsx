'use client';

import { useState, useEffect, useCallback } from 'react';
import CategorySelector from '@/components/CategorySelector';
import RankingTable from '@/components/RankingTable';
import DataSummary from '@/components/DataSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DayType, MetricType, RankType, RankingItem } from '@/lib/types';

interface SummaryData {
  totalRecords: number;
  uniqueStations: number;
  uniqueLines: number;
  dateRange: { start: string; end: string };
  weekdayCount: number;
  weekendHolidayCount: number;
}

interface RankingData {
  title: string;
  data: RankingItem[];
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
}

export default function Home() {
  // 조회 조건 상태
  const [dayType, setDayType] = useState<DayType>('weekday');
  const [metricType, setMetricType] = useState<MetricType>('boarding');
  const [rankType, setRankType] = useState<RankType>('top');
  
  // 데이터 상태
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 요약 데이터 조회
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        const response = await fetch('/api/summary');
        if (!response.ok) throw new Error('요약 데이터 조회 실패');
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error('Summary fetch error:', err);
        setError('요약 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setSummaryLoading(false);
      }
    }
    fetchSummary();
  }, []);

  // 랭킹 데이터 조회
  const fetchRanking = useCallback(async () => {
    try {
      setRankingLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        dayType,
        metricType,
        rankType,
        limit: '30',
      });
      
      const response = await fetch(`/api/rankings?${params}`);
      if (!response.ok) throw new Error('랭킹 데이터 조회 실패');
      const data = await response.json();
      setRanking(data);
    } catch (err) {
      console.error('Ranking fetch error:', err);
      setError('랭킹 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setRankingLoading(false);
    }
  }, [dayType, metricType, rankType]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  // 지표 라벨
  const getMetricLabel = () => {
    return metricType === 'boarding' ? '평균 승차 인원' : '평균 하차 인원';
  };

  return (
    <div className="space-y-6">
      {/* 데이터 요약 */}
      <DataSummary summary={summary} loading={summaryLoading} />
      
      {/* 조회 조건 선택 */}
      <CategorySelector
        dayType={dayType}
        metricType={metricType}
        rankType={rankType}
        onDayTypeChange={setDayType}
        onMetricTypeChange={setMetricType}
        onRankTypeChange={setRankType}
      />
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
          <button 
            onClick={fetchRanking}
            className="ml-4 underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}
      
      {/* 랭킹 테이블 */}
      {rankingLoading ? (
        <LoadingSpinner />
      ) : ranking ? (
        <RankingTable
          data={ranking.data}
          title={ranking.title}
          metricLabel={getMetricLabel()}
        />
      ) : null}
      
      {/* 퀵 네비게이션 */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">빠른 조회</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {getQuickLinks().map((link, index) => (
            <button
              key={index}
              onClick={() => {
                setDayType(link.dayType);
                setMetricType(link.metricType);
                setRankType(link.rankType);
              }}
              className={`
                px-3 py-2 rounded-lg text-sm text-left transition-colors
                ${dayType === link.dayType && metricType === link.metricType && rankType === link.rankType
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
              `}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* 설명 섹션 */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">분석 기준 안내</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">날짜 분류</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>평일:</strong> 월요일 ~ 금요일 (공휴일 제외)</li>
              <li><strong>주말·공휴일:</strong> 토요일, 일요일 및 법정 공휴일</li>
              <li><strong>전체:</strong> 평일 + 주말·공휴일 통합</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">지표 설명</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>승차:</strong> 해당 역에서 지하철에 탑승한 인원</li>
              <li><strong>하차:</strong> 해당 역에서 지하철에서 내린 인원</li>
              <li>모든 수치는 일평균 기준</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function getQuickLinks(): Array<{
  label: string;
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
}> {
  return [
    { label: '평일 승차 TOP 30', dayType: 'weekday', metricType: 'boarding', rankType: 'top' },
    { label: '평일 하차 TOP 30', dayType: 'weekday', metricType: 'alighting', rankType: 'top' },
    { label: '주말 승차 TOP 30', dayType: 'weekend_holiday', metricType: 'boarding', rankType: 'top' },
    { label: '주말 하차 TOP 30', dayType: 'weekend_holiday', metricType: 'alighting', rankType: 'top' },
    { label: '전체 승차 TOP 30', dayType: 'overall', metricType: 'boarding', rankType: 'top' },
    { label: '전체 하차 TOP 30', dayType: 'overall', metricType: 'alighting', rankType: 'top' },
    { label: '평일 승차 BOTTOM 30', dayType: 'weekday', metricType: 'boarding', rankType: 'bottom' },
    { label: '평일 하차 BOTTOM 30', dayType: 'weekday', metricType: 'alighting', rankType: 'bottom' },
    { label: '주말 승차 BOTTOM 30', dayType: 'weekend_holiday', metricType: 'boarding', rankType: 'bottom' },
    { label: '주말 하차 BOTTOM 30', dayType: 'weekend_holiday', metricType: 'alighting', rankType: 'bottom' },
    { label: '전체 승차 BOTTOM 30', dayType: 'overall', metricType: 'boarding', rankType: 'bottom' },
    { label: '전체 하차 BOTTOM 30', dayType: 'overall', metricType: 'alighting', rankType: 'bottom' },
  ];
}
