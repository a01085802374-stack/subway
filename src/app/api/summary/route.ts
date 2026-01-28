/**
 * 데이터 요약 정보 조회 API
 * 
 * GET /api/summary
 * Query Parameters:
 *   - year: number (년도, 선택)
 *   - month: number (월 1-12, 선택)
 * 데이터 범위, 역 수, 노선 수 등 요약 정보를 반환
 * 노선 목록과 역 목록도 함께 반환
 * 
 * 데이터 소스:
 *   - Supabase DB에 데이터가 있으면 DB 데이터 사용
 *   - DB에 데이터가 없거나 Supabase 미설정 시 샘플 데이터 사용
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSampleData, generateMonthlyData } from '@/lib/sampleData';
import { getDataSummary } from '@/lib/analytics';
import { SubwayUsageData } from '@/lib/types';
import { getSubwayUsageByMonth, getSubwayUsageByPeriod, saveSubwayUsageData } from '@/lib/subwayUsageService';
import { isSupabaseConfigured } from '@/lib/supabase';

// 샘플 데이터 캐싱 - 년월별 캐싱
const sampleDataCache = new Map<string, SubwayUsageData[]>();

/**
 * 데이터 가져오기 (DB 우선, 누락된 데이터는 백그라운드에서 추가)
 * - DB에 데이터가 있으면 반환
 * - 누락된 레코드는 백그라운드에서 INSERT (응답을 블로킹하지 않음)
 * - 타임아웃: 30초
 */
async function getData(year?: number, month?: number): Promise<SubwayUsageData[]> {
  const cacheKey = year && month ? `${year}-${month}` : 'default';
  
  // Supabase가 설정되어 있는 경우
  if (isSupabaseConfigured()) {
    // 샘플 데이터 먼저 생성 (빠름)
    const sampleData = year && month ? generateMonthlyData(year, month) : generateSampleData();
    
    // DB에서 기존 데이터 조회 시도
    let dbData: SubwayUsageData[] = [];
    
    try {
      if (year && month) {
        dbData = await getSubwayUsageByMonth(year, month);
      } else {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        dbData = await getSubwayUsageByPeriod(startDate, endDate);
      }
    } catch (err) {
      console.error('[getData] DB 조회 실패, 샘플 데이터 사용:', err);
      // DB 조회 실패 시 샘플 데이터 반환
      return sampleData;
    }
    
    // 백그라운드에서 누락 데이터 저장 (절대 await 하지 않음)
    // Edge Runtime에서는 응답 후에도 백그라운드 작업이 일정 시간 실행됨
    Promise.resolve().then(() => {
      saveSubwayUsageData(sampleData, 'sample').then(result => {
        if (result.inserted > 0) {
          console.log(`[Background-Sync] inserted=${result.inserted}, skipped=${result.skipped}`);
        }
      }).catch(err => {
        console.error('[Background-Sync] 저장 실패:', err);
      });
    });
    
    // DB 데이터가 있으면 DB 데이터 반환, 없으면 샘플 데이터 반환
    if (dbData.length > 0) {
      return dbData;
    }
    
    return sampleData;
  }
  
  // Supabase 미설정 시 샘플 데이터 사용 (캐시 활용)
  if (!sampleDataCache.has(cacheKey)) {
    const data = year && month ? generateMonthlyData(year, month) : generateSampleData();
    sampleDataCache.set(cacheKey, data);
  }
  
  return sampleDataCache.get(cacheKey)!;
}

/**
 * 노선 목록 추출 (1호선부터 정렬)
 */
function getLineList(data: SubwayUsageData[]): string[] {
  const lines = new Set(data.map(d => d.lineName));
  return Array.from(lines).sort((a, b) => {
    // 숫자 추출하여 정렬
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 999;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 999;
    return numA - numB;
  });
}

/**
 * 역 목록 추출 (가나다순 정렬) - 노선별로 분리하여 평균 승/하차 인원 포함
 * 환승역은 노선별로 각각 별도의 행으로 표시
 * 데이터가 없는 역/날짜는 제외하고 실제 데이터만으로 평균 계산
 */
function getStationList(data: SubwayUsageData[]): Array<{ 
  name: string; 
  line: string;
  avgBoarding: number;
  avgAlighting: number;
  dataCount: number;  // 실제 데이터 일수
}> {
  // 역+노선 조합별 데이터 집계
  const stationLineMap = new Map<string, {
    name: string;
    line: string;
    totalBoarding: number;
    totalAlighting: number;
    count: number;
  }>();
  
  for (const record of data) {
    // 유효한 데이터만 집계 (승차 또는 하차 인원이 있는 경우)
    if (record.boardingCount <= 0 && record.alightingCount <= 0) {
      continue;
    }
    
    const key = `${record.stationName}|${record.lineName}`;
    if (!stationLineMap.has(key)) {
      stationLineMap.set(key, {
        name: record.stationName,
        line: record.lineName,
        totalBoarding: 0,
        totalAlighting: 0,
        count: 0,
      });
    }
    const station = stationLineMap.get(key)!;
    station.totalBoarding += record.boardingCount;
    station.totalAlighting += record.alightingCount;
    station.count += 1;
  }
  
  // 데이터가 있는 역만 결과에 포함
  const stations = Array.from(stationLineMap.values())
    .filter((data) => data.count > 0)  // 데이터가 없는 역 제외
    .map((data) => ({
      name: data.name,
      line: data.line,
      // 실제 데이터가 있는 일수로 일평균 계산
      avgBoarding: Math.round(data.totalBoarding / data.count),
      avgAlighting: Math.round(data.totalAlighting / data.count),
      dataCount: data.count,
    }));
  
  // 가나다순 정렬 (역명 기준, 같은 역은 노선번호순)
  return stations.sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name, 'ko');
    if (nameCompare !== 0) return nameCompare;
    // 같은 역이면 노선 번호순
    const numA = parseInt(a.line.replace(/[^0-9]/g, '')) || 999;
    const numB = parseInt(b.line.replace(/[^0-9]/g, '')) || 999;
    return numA - numB;
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 년월 파라미터 추출
    const yearStr = searchParams.get('year');
    const monthStr = searchParams.get('month');
    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    const month = monthStr ? parseInt(monthStr, 10) : undefined;
    
    // 년월 파라미터 검증
    if ((year && !month) || (!year && month)) {
      return NextResponse.json(
        { error: 'Both year and month parameters are required when filtering by date' },
        { status: 400 }
      );
    }
    
    if (year && (year < 2025 || year > 2026)) {
      return NextResponse.json(
        { error: 'Invalid year parameter. Valid values: 2025, 2026' },
        { status: 400 }
      );
    }
    
    if (month && (month < 1 || month > 12)) {
      return NextResponse.json(
        { error: 'Invalid month parameter. Valid values: 1-12' },
        { status: 400 }
      );
    }
    
    const data = await getData(year, month);
    const summary = getDataSummary(data);
    
    // 데이터 소스 정보 추가
    const dataSource = isSupabaseConfigured() && !(await shouldUseSampleData(year, month))
      ? 'database'
      : 'sample';
    const lineList = getLineList(data);
    const stationList = getStationList(data);
    
    return NextResponse.json({
      ...summary,
      lineList,
      stationList,
      year,
      month,
      dataSource,  // 'database' 또는 'sample'
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
