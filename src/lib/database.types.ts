/**
 * Supabase Database 타입 정의
 * 
 * 이 파일은 Supabase CLI로 자동 생성하거나 수동으로 정의합니다.
 * 명령어: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
 */

// 휴일여부 타입
export type HolidayType = '평일' | '토요일' | '일요일' | '공휴일';

/**
 * subway_usage 테이블 Row 타입
 * 지하철 이용객 마스터 테이블의 전체 컬럼 정의
 */
export interface SubwayUsageRow {
  /** 고유 식별자 (자동 생성) */
  id: number;
  /** 사용일자: 이용한 날짜 (YYYY-MM-DD 형식) */
  usage_date: string;
  /** 휴일여부: 평일, 토요일, 일요일, 공휴일 구분 */
  holiday_type: HolidayType;
  /** 노선명: 지하철 노선명 */
  line_name: string;
  /** 역명: 지하철 역명 */
  station_name: string;
  /** 승차고객수: 해당일 승차 고객수 */
  boarding_count: number;
  /** 하차고객수: 해당일 하차 고객수 */
  alighting_count: number;
  /** 데이터 INSERT 일시: 해당 행이 DB에 삽입된 시간 (ISO 8601 형식) */
  created_at: string;
  /** 데이터 최종 수정 일시: 해당 행이 마지막으로 수정된 시간 (ISO 8601 형식) */
  updated_at: string;
}

// subway_usage 테이블 Insert 타입 (id, created_at, updated_at은 선택적)
export interface SubwayUsageInsert {
  usage_date: string;
  holiday_type: HolidayType;
  line_name: string;
  station_name: string;
  boarding_count: number;
  alighting_count: number;
}

// subway_usage 테이블 Update 타입 (모든 필드 선택적)
export interface SubwayUsageUpdate {
  usage_date?: string;
  holiday_type?: HolidayType;
  line_name?: string;
  station_name?: string;
  boarding_count?: number;
  alighting_count?: number;
}

// Supabase Database 스키마 타입
export interface Database {
  public: {
    Tables: {
      subway_usage: {
        Row: SubwayUsageRow;
        Insert: SubwayUsageInsert;
        Update: SubwayUsageUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      holiday_type: HolidayType;
    };
  };
}

/**
 * 조회 결과 타입 (API 응답용)
 * camelCase 형식으로 변환된 데이터
 */
export interface SubwayUsageRecord {
  /** 고유 식별자 */
  id: number;
  /** 사용일자: 이용한 날짜 (YYYY-MM-DD) */
  usageDate: string;
  /** 휴일여부: 평일, 토요일, 일요일, 공휴일 */
  holidayType: HolidayType;
  /** 노선명 */
  lineName: string;
  /** 역명 */
  stationName: string;
  /** 승차고객수 */
  boardingCount: number;
  /** 하차고객수 */
  alightingCount: number;
  /** 데이터 INSERT 일시: 해당 행이 DB에 삽입된 시간 */
  createdAt: string;
  /** 데이터 최종 수정 일시 */
  updatedAt: string;
}

// DB Row를 API 응답 형식으로 변환
export function toSubwayUsageRecord(row: SubwayUsageRow): SubwayUsageRecord {
  return {
    id: row.id,
    usageDate: row.usage_date,
    holidayType: row.holiday_type,
    lineName: row.line_name,
    stationName: row.station_name,
    boardingCount: row.boarding_count,
    alightingCount: row.alighting_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// API 요청 형식을 DB Insert 형식으로 변환
export function toSubwayUsageInsert(
  usageDate: string,
  holidayType: HolidayType,
  lineName: string,
  stationName: string,
  boardingCount: number,
  alightingCount: number
): SubwayUsageInsert {
  return {
    usage_date: usageDate,
    holiday_type: holidayType,
    line_name: lineName,
    station_name: stationName,
    boarding_count: boardingCount,
    alighting_count: alightingCount,
  };
}
