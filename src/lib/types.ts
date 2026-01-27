// 지하철 이용객 데이터 타입
export interface SubwayUsageData {
  stationName: string;      // 역 이름
  lineName: string;         // 노선명
  date: string;             // 날짜 (YYYY-MM-DD)
  boardingCount: number;    // 승차 인원
  alightingCount: number;   // 하차 인원
}

// 집계된 역별 평균 데이터
export interface StationAverageData {
  stationName: string;
  lineName: string;
  avgBoarding: number;      // 평균 승차
  avgAlighting: number;     // 평균 하차
  totalDays: number;        // 집계 일수
}

// 분석 결과 타입
export interface AnalysisResult {
  weekdayAvg: StationAverageData[];        // 평일 평균
  weekendHolidayAvg: StationAverageData[]; // 주말·공휴일 평균
  overallAvg: StationAverageData[];        // 전체 평균
}

// 랭킹 조회 옵션
export type DayType = 'weekday' | 'weekend_holiday' | 'overall';
export type MetricType = 'boarding' | 'alighting';
export type RankType = 'top' | 'bottom';

export interface RankingQuery {
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
  limit?: number;
}

// API 응답 타입
export interface RankingItem {
  rank: number;
  stationName: string;
  lineName: string;
  count: number;
}

export interface RankingResponse {
  title: string;
  data: RankingItem[];
  dayType: DayType;
  metricType: MetricType;
  rankType: RankType;
  generatedAt: string;
}
