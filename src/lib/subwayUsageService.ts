/**
 * 지하철 이용객 데이터 서비스
 * 
 * Supabase DB와 연동하여 데이터를 조회, 저장, 관리합니다.
 * - 데이터 조회: 기간, 노선, 역 기준으로 조회
 * - 데이터 저장: 중복 체크 후 신규 데이터만 Insert (upsert 로직)
 * - 분석 데이터: 평일/주말 평균 등 집계
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { 
  SubwayUsageRow, 
  SubwayUsageInsert,
  HolidayType,
  toSubwayUsageRecord 
} from './database.types';
import { SubwayUsageData } from './types';
import { isHoliday, isWeekend } from './holidays';

/**
 * 날짜를 기반으로 휴일 타입 결정
 * @param dateStr - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 휴일 타입 ('평일' | '토요일' | '일요일' | '공휴일')
 */
export function getHolidayType(dateStr: string): HolidayType {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  // 공휴일 체크 (토/일 포함 공휴일도 '공휴일'로 표시)
  if (isHoliday(dateStr)) {
    return '공휴일';
  }
  
  // 토요일
  if (dayOfWeek === 6) {
    return '토요일';
  }
  
  // 일요일
  if (dayOfWeek === 0) {
    return '일요일';
  }
  
  // 평일
  return '평일';
}

/**
 * 특정 기간의 지하철 이용 데이터 조회
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @param lineName - 노선명 (선택)
 * @param stationName - 역명 (선택)
 */
export async function getSubwayUsageByPeriod(
  startDate: string,
  endDate: string,
  lineName?: string,
  stationName?: string
): Promise<SubwayUsageData[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }
  
  let query = supabase
    .from('subway_usage')
    .select('*')
    .gte('usage_date', startDate)
    .lte('usage_date', endDate)
    .order('usage_date', { ascending: true });
  
  if (lineName) {
    query = query.eq('line_name', lineName);
  }
  
  if (stationName) {
    query = query.eq('station_name', stationName);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching subway usage data:', error);
    throw new Error(`데이터 조회 실패: ${error.message}`);
  }
  
  // DB 형식을 앱 형식으로 변환
  return (data || []).map((row: SubwayUsageRow) => ({
    stationName: row.station_name,
    lineName: row.line_name,
    date: row.usage_date,
    boardingCount: row.boarding_count,
    alightingCount: row.alighting_count,
  }));
}

/**
 * 특정 년월의 지하철 이용 데이터 조회
 * @param year - 년도
 * @param month - 월 (1-12)
 */
export async function getSubwayUsageByMonth(
  year: number,
  month: number
): Promise<SubwayUsageData[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  
  return getSubwayUsageByPeriod(startDate, endDate);
}

/**
 * 기존 데이터 존재 여부 확인
 * @param usageDate - 사용일자
 * @param lineName - 노선명
 * @param stationName - 역명
 */
export async function checkDataExists(
  usageDate: string,
  lineName: string,
  stationName: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('subway_usage')
    .select('id')
    .eq('usage_date', usageDate)
    .eq('line_name', lineName)
    .eq('station_name', stationName)
    .limit(1);
  
  if (error) {
    console.error('Error checking data existence:', error);
    return false;
  }
  
  return (data?.length ?? 0) > 0;
}

/**
 * 기간 내 기존 데이터 조회 (중복 체크용)
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 기존 데이터의 (날짜, 노선, 역) 키 Set
 */
export async function getExistingDataKeys(
  startDate: string,
  endDate: string
): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return new Set();
  }
  
  const { data, error } = await supabase
    .from('subway_usage')
    .select('usage_date, line_name, station_name')
    .gte('usage_date', startDate)
    .lte('usage_date', endDate);
  
  if (error) {
    console.error('Error fetching existing data keys:', error);
    return new Set();
  }
  
  // 키 생성: "날짜|노선|역"
  const keys = new Set<string>();
  for (const row of data || []) {
    keys.add(`${row.usage_date}|${row.line_name}|${row.station_name}`);
  }
  
  return keys;
}

/**
 * 지하철 이용 데이터 저장 (Upsert 로직)
 * 
 * - 조회 대상 기간에 속하는 날짜, 노선명, 역명 data가 없으면 Insert
 * - 조회 대상 기간에 속하는 날짜, 노선명, 역명에 해당하는 데이터가 있으면 스킵 (기존 데이터 사용)
 * 
 * @param records - 저장할 데이터 배열
 * @returns 저장 결과 (신규 저장 건수, 스킵 건수)
 */
export async function saveSubwayUsageData(
  records: SubwayUsageData[]
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { inserted: 0, skipped: 0, errors: ['Supabase가 설정되지 않았습니다.'] };
  }
  
  if (records.length === 0) {
    return { inserted: 0, skipped: 0, errors: [] };
  }
  
  // 기간 범위 계산
  const dates = records.map(r => r.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  
  // 기존 데이터 키 조회
  const existingKeys = await getExistingDataKeys(startDate, endDate);
  
  // 신규 데이터만 필터링
  const newRecords: SubwayUsageInsert[] = [];
  let skippedCount = 0;
  
  for (const record of records) {
    const key = `${record.date}|${record.lineName}|${record.stationName}`;
    
    if (existingKeys.has(key)) {
      // 기존 데이터 있음 - 스킵
      skippedCount++;
    } else {
      // 신규 데이터 - Insert 대상
      newRecords.push({
        usage_date: record.date,
        holiday_type: getHolidayType(record.date),
        line_name: record.lineName,
        station_name: record.stationName,
        boarding_count: record.boardingCount,
        alighting_count: record.alightingCount,
      });
    }
  }
  
  if (newRecords.length === 0) {
    return { inserted: 0, skipped: skippedCount, errors: [] };
  }
  
  // 배치 Insert (Supabase는 한 번에 1000개까지 권장)
  const BATCH_SIZE = 1000;
  let insertedCount = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
    const batch = newRecords.slice(i, i + BATCH_SIZE);
    
    const { data, error } = await supabase
      .from('subway_usage')
      .insert(batch)
      .select('id');
    
    if (error) {
      console.error(`Batch insert error (${i}-${i + batch.length}):`, error);
      errors.push(`배치 ${Math.floor(i / BATCH_SIZE) + 1} 저장 실패: ${error.message}`);
    } else {
      insertedCount += data?.length || 0;
    }
  }
  
  return { inserted: insertedCount, skipped: skippedCount, errors };
}

/**
 * 지하철 이용 데이터 단건 저장 (중복 시 스킵)
 */
export async function saveSubwayUsageSingle(
  record: SubwayUsageData
): Promise<{ success: boolean; isNew: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { success: false, isNew: false, error: 'Supabase가 설정되지 않았습니다.' };
  }
  
  // 기존 데이터 확인
  const exists = await checkDataExists(record.date, record.lineName, record.stationName);
  
  if (exists) {
    return { success: true, isNew: false };
  }
  
  // 신규 데이터 Insert
  const { error } = await supabase
    .from('subway_usage')
    .insert({
      usage_date: record.date,
      holiday_type: getHolidayType(record.date),
      line_name: record.lineName,
      station_name: record.stationName,
      boarding_count: record.boardingCount,
      alighting_count: record.alightingCount,
    });
  
  if (error) {
    return { success: false, isNew: false, error: error.message };
  }
  
  return { success: true, isNew: true };
}

/**
 * 휴일 타입별 데이터 조회
 * @param holidayType - 휴일 타입
 * @param year - 년도 (선택)
 * @param month - 월 (선택)
 */
export async function getSubwayUsageByHolidayType(
  holidayType: HolidayType,
  year?: number,
  month?: number
): Promise<SubwayUsageData[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return [];
  }
  
  let query = supabase
    .from('subway_usage')
    .select('*')
    .eq('holiday_type', holidayType);
  
  if (year && month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    query = query.gte('usage_date', startDate).lte('usage_date', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching data by holiday type:', error);
    return [];
  }
  
  return (data || []).map((row: SubwayUsageRow) => ({
    stationName: row.station_name,
    lineName: row.line_name,
    date: row.usage_date,
    boardingCount: row.boarding_count,
    alightingCount: row.alighting_count,
  }));
}

/**
 * 역별 평균 승하차 인원 조회 (DB 집계)
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @param holidayTypes - 휴일 타입 필터 (선택)
 */
export async function getStationAverages(
  startDate: string,
  endDate: string,
  holidayTypes?: HolidayType[]
): Promise<{
  stationName: string;
  lineName: string;
  avgBoarding: number;
  avgAlighting: number;
  totalDays: number;
}[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return [];
  }
  
  // Supabase에서 집계 쿼리 실행
  // 참고: Supabase는 직접적인 GROUP BY를 지원하지 않으므로 
  // 데이터를 가져온 후 클라이언트에서 집계하거나 RPC 함수를 사용해야 함
  
  let query = supabase
    .from('subway_usage')
    .select('station_name, line_name, boarding_count, alighting_count')
    .gte('usage_date', startDate)
    .lte('usage_date', endDate);
  
  if (holidayTypes && holidayTypes.length > 0) {
    query = query.in('holiday_type', holidayTypes);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching station averages:', error);
    return [];
  }
  
  // 클라이언트 측 집계
  const stationMap = new Map<string, {
    totalBoarding: number;
    totalAlighting: number;
    count: number;
    lineName: string;
  }>();
  
  for (const row of data || []) {
    const key = `${row.line_name}|${row.station_name}`;
    const existing = stationMap.get(key);
    
    if (existing) {
      existing.totalBoarding += row.boarding_count;
      existing.totalAlighting += row.alighting_count;
      existing.count += 1;
    } else {
      stationMap.set(key, {
        totalBoarding: row.boarding_count,
        totalAlighting: row.alighting_count,
        count: 1,
        lineName: row.line_name,
      });
    }
  }
  
  // 평균 계산 및 결과 반환
  const results: {
    stationName: string;
    lineName: string;
    avgBoarding: number;
    avgAlighting: number;
    totalDays: number;
  }[] = [];
  
  stationMap.forEach((value, key) => {
    const [lineName, stationName] = key.split('|');
    results.push({
      stationName,
      lineName,
      avgBoarding: Math.round(value.totalBoarding / value.count),
      avgAlighting: Math.round(value.totalAlighting / value.count),
      totalDays: value.count,
    });
  });
  
  return results;
}

/**
 * 특정 기간 내 데이터 존재 여부 확인
 */
export async function hasDataForPeriod(
  startDate: string,
  endDate: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('subway_usage')
    .select('id')
    .gte('usage_date', startDate)
    .lte('usage_date', endDate)
    .limit(1);
  
  if (error) {
    console.error('Error checking period data:', error);
    return false;
  }
  
  return (data?.length ?? 0) > 0;
}

/**
 * 데이터 저장 여부에 따라 DB 또는 샘플 데이터 사용 결정
 */
export async function shouldUseSampleData(year?: number, month?: number): Promise<boolean> {
  // Supabase가 설정되지 않은 경우 샘플 데이터 사용
  if (!isSupabaseConfigured()) {
    return true;
  }
  
  // 기간이 지정된 경우 해당 기간 데이터 존재 여부 확인
  if (year && month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    
    const hasData = await hasDataForPeriod(startDate, endDate);
    return !hasData;
  }
  
  // 기간 미지정 시 최근 30일 데이터 확인
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  
  const hasData = await hasDataForPeriod(startDate, endDate);
  return !hasData;
}
