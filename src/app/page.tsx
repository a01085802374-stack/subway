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
  lineList?: string[];
  stationList?: Array<{ name: string; line: string; avgBoarding?: number; avgAlighting?: number; dataCount?: number }>;
  year?: number;
  month?: number;
}

interface RankingData {
  title: string;
  data: RankingItem[];
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
}

// 사용 가능한 년도/월 옵션
const AVAILABLE_YEARS = [2025, 2026];
const AVAILABLE_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 현재 년월 기본값 (2026년 1월로 설정 - 오늘 날짜 기준)
const getDefaultYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // 2025-2026 범위 내인지 확인
  if (year >= 2025 && year <= 2026) {
    return { year, month };
  }
  return { year: 2026, month: 1 };
};

export default function Home() {
  // 년월 선택 상태
  const defaultYearMonth = getDefaultYearMonth();
  const [selectedYear, setSelectedYear] = useState<number>(defaultYearMonth.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultYearMonth.month);
  const [appliedYear, setAppliedYear] = useState<number>(defaultYearMonth.year);
  const [appliedMonth, setAppliedMonth] = useState<number>(defaultYearMonth.month);
  
  // 조회 조건 상태
  const [dayType, setDayType] = useState<DayType>('weekday');
  const [metricType, setMetricType] = useState<MetricType>('boarding');
  const [rankType, setRankType] = useState<RankType>('top');
  
  // 데이터 상태
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // 요약 데이터 조회
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const params = new URLSearchParams({
        year: appliedYear.toString(),
        month: appliedMonth.toString(),
      });
      const response = await fetch(`/api/summary?${params}`);
      if (!response.ok) throw new Error('요약 데이터 조회 실패');
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Summary fetch error:', err);
      setError('요약 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setSummaryLoading(false);
    }
  }, [appliedYear, appliedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
        year: appliedYear.toString(),
        month: appliedMonth.toString(),
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
  }, [dayType, metricType, rankType, appliedYear, appliedMonth]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);
  
  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    setAppliedYear(selectedYear);
    setAppliedMonth(selectedMonth);
  };

  // 데이터 가져오기 버튼 클릭 핸들러 (DB에 INSERT)
  const handleSync = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage(null);
      setError(null);
      
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          year: selectedYear, 
          month: selectedMonth 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSyncMessage(`${selectedYear}년 ${selectedMonth}월 데이터 저장 완료! (저장: ${data.stats?.inserted || 0}건, 스킵: ${data.stats?.skipped || 0}건)`);
        // 저장 후 자동으로 조회
        setAppliedYear(selectedYear);
        setAppliedMonth(selectedMonth);
      } else {
        setError(`데이터 저장 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setSyncLoading(false);
    }
  };

  // 지표 라벨
  const getMetricLabel = () => {
    return metricType === 'boarding' ? '평균 승차 인원' : '평균 하차 인원';
  };

  return (
    <div className="space-y-6">
      {/* 년월 선택 - 지브리 스타일 */}
      <div className="ghibli-card p-5">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-ghibli-charcoal flex items-center gap-2">
          <span className="text-xl">📅</span>
          분석 기간 선택
        </h2>
        <div className="flex flex-wrap items-end gap-3 sm:gap-4">
          {/* 년도 선택 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-ghibli-earth mb-2">
              년도
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="ghibli-select min-w-[100px]"
            >
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
          </div>
          
          {/* 월 선택 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-ghibli-earth mb-2">
              월
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="ghibli-select min-w-[80px]"
            >
              {AVAILABLE_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
          
          {/* 조회 버튼 - 지브리 스타일 */}
          <button
            onClick={handleSearch}
            disabled={summaryLoading || rankingLoading || syncLoading}
            className="ghibli-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {summaryLoading || rankingLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                조회 중...
              </span>
            ) : (
              <span className="flex items-center gap-1">🔍 조회</span>
            )}
          </button>
          
          {/* 데이터 가져오기 버튼 - 지브리 스타일 */}
          <button
            onClick={handleSync}
            disabled={summaryLoading || rankingLoading || syncLoading}
            className="ghibli-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {syncLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                저장 중...
              </span>
            ) : (
              <span className="flex items-center gap-1">📥 데이터 가져오기</span>
            )}
          </button>
          
          {/* 현재 조회 중인 기간 표시 */}
          {(appliedYear !== selectedYear || appliedMonth !== selectedMonth) && !syncLoading && (
            <div className="text-xs text-ghibli-terracotta flex items-center gap-1">
              <span>🍃</span>
              조회 버튼을 눌러 데이터를 갱신하세요
            </div>
          )}
        </div>
      </div>
      
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
      
      {/* 성공 메시지 - 지브리 스타일 */}
      {syncMessage && (
        <div className="bg-ghibli-mint/30 border-2 border-ghibli-leaf rounded-2xl p-4 text-ghibli-forest flex items-center gap-2 shadow-ghibli">
          <span className="text-xl">🌸</span>
          {syncMessage}
          <button 
            onClick={() => setSyncMessage(null)}
            className="ml-auto text-ghibli-forest hover:text-ghibli-leaf transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* 에러 메시지 - 지브리 스타일 */}
      {error && (
        <div className="bg-ghibli-coral/20 border-2 border-ghibli-terracotta rounded-2xl p-4 text-ghibli-terracotta shadow-ghibli">
          <span className="mr-2">🍂</span>
          {error}
          <button 
            onClick={fetchRanking}
            className="ml-4 underline hover:no-underline text-ghibli-bark"
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
      
      {/* 퀵 네비게이션 - 지브리 스타일 */}
      <div className="ghibli-card p-5">
        <h2 className="text-lg font-semibold mb-4 text-ghibli-charcoal flex items-center gap-2">
          <span className="text-xl">⚡</span>
          빠른 조회
        </h2>
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
                px-3 py-2 rounded-xl text-sm text-left transition-all duration-200
                ${dayType === link.dayType && metricType === link.metricType && rankType === link.rankType
                  ? 'bg-ghibli-leaf/30 text-ghibli-forest font-medium border-2 border-ghibli-leaf shadow-md'
                  : 'bg-ghibli-beige/50 hover:bg-ghibli-moss/20 text-ghibli-brown border-2 border-transparent hover:border-ghibli-sand'
                }
              `}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* 설명 섹션 - 지브리 스타일 */}
      <div className="ghibli-card p-5">
        <h2 className="text-lg font-semibold mb-4 text-ghibli-charcoal flex items-center gap-2">
          <span className="text-xl">📖</span>
          분석 기준 안내
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-ghibli-brown">
          <div className="bg-ghibli-sky/10 rounded-xl p-4 border border-ghibli-cloud">
            <h3 className="font-medium text-ghibli-charcoal mb-3 flex items-center gap-2">
              <span>🗓️</span>
              날짜 분류
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-ghibli-forest">🌿</span>
                <span><strong className="text-ghibli-charcoal">평일:</strong> 월요일 ~ 금요일 (공휴일 제외)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ghibli-terracotta">🌅</span>
                <span><strong className="text-ghibli-charcoal">주말·공휴일:</strong> 토요일, 일요일 및 법정 공휴일</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ghibli-water">🌊</span>
                <span><strong className="text-ghibli-charcoal">전체:</strong> 평일 + 주말·공휴일 통합</span>
              </li>
            </ul>
          </div>
          <div className="bg-ghibli-sunset/10 rounded-xl p-4 border border-ghibli-coral/30">
            <h3 className="font-medium text-ghibli-charcoal mb-3 flex items-center gap-2">
              <span>📊</span>
              지표 설명
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-ghibli-forest">🚶</span>
                <span><strong className="text-ghibli-charcoal">승차:</strong> 해당 역에서 지하철에 탑승한 인원</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ghibli-terracotta">🚶‍♂️</span>
                <span><strong className="text-ghibli-charcoal">하차:</strong> 해당 역에서 지하철에서 내린 인원</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ghibli-earth">📈</span>
                <span>모든 수치는 <strong className="text-ghibli-charcoal">일평균</strong> 기준</span>
              </li>
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
