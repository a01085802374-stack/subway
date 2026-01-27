/**
 * 지하철 이용객 데이터 분석 로직
 * 
 * 주요 기능:
 * 1. 평일/주말·공휴일 평균 계산
 * 2. TOP/BOTTOM 랭킹 산출
 */

import {
  SubwayUsageData,
  StationAverageData,
  AnalysisResult,
  DayType,
  MetricType,
  RankType,
  RankingItem,
} from './types';
import { isWeekday } from './holidays';

/**
 * 역별 + 날짜 유형별 집계 데이터 타입
 */
interface StationAccumulator {
  stationName: string;
  lineName: string;
  weekday: {
    totalBoarding: number;
    totalAlighting: number;
    count: number;
  };
  weekendHoliday: {
    totalBoarding: number;
    totalAlighting: number;
    count: number;
  };
}

/**
 * 원시 데이터를 역별로 집계
 * @param data - 지하철 이용객 원시 데이터
 * @returns 역별 집계 맵
 */
function aggregateByStation(data: SubwayUsageData[]): Map<string, StationAccumulator> {
  const accumulator = new Map<string, StationAccumulator>();

  for (const record of data) {
    // 역 고유 키 생성 (역이름 + 노선)
    const key = `${record.stationName}|${record.lineName}`;
    
    if (!accumulator.has(key)) {
      accumulator.set(key, {
        stationName: record.stationName,
        lineName: record.lineName,
        weekday: { totalBoarding: 0, totalAlighting: 0, count: 0 },
        weekendHoliday: { totalBoarding: 0, totalAlighting: 0, count: 0 },
      });
    }

    const station = accumulator.get(key)!;
    
    if (isWeekday(record.date)) {
      station.weekday.totalBoarding += record.boardingCount;
      station.weekday.totalAlighting += record.alightingCount;
      station.weekday.count += 1;
    } else {
      station.weekendHoliday.totalBoarding += record.boardingCount;
      station.weekendHoliday.totalAlighting += record.alightingCount;
      station.weekendHoliday.count += 1;
    }
  }

  return accumulator;
}

/**
 * 평균 계산
 * @param total - 합계
 * @param count - 개수
 * @returns 평균 (소수점 반올림)
 */
function calculateAverage(total: number, count: number): number {
  if (count === 0) return 0;
  return Math.round(total / count);
}

/**
 * 전체 분석 결과 생성
 * @param data - 지하철 이용객 원시 데이터
 * @returns 분석 결과 (평일/주말·공휴일/전체 평균)
 */
export function analyzeData(data: SubwayUsageData[]): AnalysisResult {
  const aggregated = aggregateByStation(data);
  
  const weekdayAvg: StationAverageData[] = [];
  const weekendHolidayAvg: StationAverageData[] = [];
  const overallAvg: StationAverageData[] = [];

  for (const station of aggregated.values()) {
    // 평일 평균
    if (station.weekday.count > 0) {
      weekdayAvg.push({
        stationName: station.stationName,
        lineName: station.lineName,
        avgBoarding: calculateAverage(station.weekday.totalBoarding, station.weekday.count),
        avgAlighting: calculateAverage(station.weekday.totalAlighting, station.weekday.count),
        totalDays: station.weekday.count,
      });
    }

    // 주말·공휴일 평균
    if (station.weekendHoliday.count > 0) {
      weekendHolidayAvg.push({
        stationName: station.stationName,
        lineName: station.lineName,
        avgBoarding: calculateAverage(station.weekendHoliday.totalBoarding, station.weekendHoliday.count),
        avgAlighting: calculateAverage(station.weekendHoliday.totalAlighting, station.weekendHoliday.count),
        totalDays: station.weekendHoliday.count,
      });
    }

    // 전체 평균
    const totalBoarding = station.weekday.totalBoarding + station.weekendHoliday.totalBoarding;
    const totalAlighting = station.weekday.totalAlighting + station.weekendHoliday.totalAlighting;
    const totalCount = station.weekday.count + station.weekendHoliday.count;
    
    if (totalCount > 0) {
      overallAvg.push({
        stationName: station.stationName,
        lineName: station.lineName,
        avgBoarding: calculateAverage(totalBoarding, totalCount),
        avgAlighting: calculateAverage(totalAlighting, totalCount),
        totalDays: totalCount,
      });
    }
  }

  return { weekdayAvg, weekendHolidayAvg, overallAvg };
}

/**
 * 랭킹 데이터 생성
 * @param analysisResult - 분석 결과
 * @param dayType - 날짜 유형 (평일/주말·공휴일/전체)
 * @param metricType - 지표 유형 (승차/하차)
 * @param rankType - 랭킹 유형 (TOP/BOTTOM)
 * @param limit - 조회 개수 (기본값: 30)
 * @returns 랭킹 아이템 배열
 */
export function getRanking(
  analysisResult: AnalysisResult,
  dayType: DayType,
  metricType: MetricType,
  rankType: RankType,
  limit: number = 30
): RankingItem[] {
  // 날짜 유형에 따른 데이터 선택
  let sourceData: StationAverageData[];
  switch (dayType) {
    case 'weekday':
      sourceData = analysisResult.weekdayAvg;
      break;
    case 'weekend_holiday':
      sourceData = analysisResult.weekendHolidayAvg;
      break;
    case 'overall':
      sourceData = analysisResult.overallAvg;
      break;
  }

  // 정렬 기준 선택
  const getValue = (item: StationAverageData): number => {
    return metricType === 'boarding' ? item.avgBoarding : item.avgAlighting;
  };

  // 정렬 (TOP: 내림차순, BOTTOM: 오름차순)
  const sorted = [...sourceData].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);
    return rankType === 'top' ? valueB - valueA : valueA - valueB;
  });

  // 상위/하위 N개 선택 및 랭킹 부여
  return sorted.slice(0, limit).map((item, index) => ({
    rank: index + 1,
    stationName: item.stationName,
    lineName: item.lineName,
    count: getValue(item),
  }));
}

/**
 * 랭킹 제목 생성
 * @param dayType - 날짜 유형
 * @param metricType - 지표 유형
 * @param rankType - 랭킹 유형
 * @param limit - 조회 개수
 * @returns 제목 문자열
 */
export function getRankingTitle(
  dayType: DayType,
  metricType: MetricType,
  rankType: RankType,
  limit: number = 30
): string {
  const dayTypeStr = {
    weekday: '평일',
    weekend_holiday: '주말·공휴일',
    overall: '전체',
  }[dayType];

  const metricTypeStr = metricType === 'boarding' ? '승차' : '하차';
  const rankTypeStr = rankType === 'top' ? 'TOP' : 'BOTTOM';

  return `${dayTypeStr} 평균 ${metricTypeStr} ${rankTypeStr} ${limit}`;
}

/**
 * 모든 랭킹 카테고리 목록 생성
 * @returns 랭킹 쿼리 배열
 */
export function getAllRankingCategories(): Array<{
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
  title: string;
}> {
  const categories: Array<{
    dayType: DayType;
    metricType: MetricType;
    rankType: RankType;
    title: string;
  }> = [];

  const dayTypes: DayType[] = ['weekday', 'weekend_holiday', 'overall'];
  const metricTypes: MetricType[] = ['boarding', 'alighting'];
  const rankTypes: RankType[] = ['top', 'bottom'];

  for (const dayType of dayTypes) {
    for (const metricType of metricTypes) {
      for (const rankType of rankTypes) {
        categories.push({
          dayType,
          metricType,
          rankType,
          title: getRankingTitle(dayType, metricType, rankType),
        });
      }
    }
  }

  return categories;
}

/**
 * 통계 요약 정보 생성
 * @param data - 원시 데이터
 * @returns 통계 요약
 */
export function getDataSummary(data: SubwayUsageData[]): {
  totalRecords: number;
  uniqueStations: number;
  uniqueLines: number;
  dateRange: { start: string; end: string };
  weekdayCount: number;
  weekendHolidayCount: number;
} {
  const stations = new Set(data.map(d => `${d.stationName}|${d.lineName}`));
  const lines = new Set(data.map(d => d.lineName));
  const dates = data.map(d => d.date).sort();
  const uniqueDates = [...new Set(dates)];
  
  let weekdayCount = 0;
  let weekendHolidayCount = 0;
  
  for (const date of uniqueDates) {
    if (isWeekday(date)) {
      weekdayCount++;
    } else {
      weekendHolidayCount++;
    }
  }

  return {
    totalRecords: data.length,
    uniqueStations: stations.size,
    uniqueLines: lines.size,
    dateRange: {
      start: dates[0] || '',
      end: dates[dates.length - 1] || '',
    },
    weekdayCount,
    weekendHolidayCount,
  };
}
