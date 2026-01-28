/**
 * 데이터 요약 정보 조회 API
 * 
 * GET /api/summary
 * Query Parameters:
 *   - year: number (년도, 선택)
 *   - month: number (월 1-12, 선택)
 * 데이터 범위, 역 수, 노선 수 등 요약 정보를 반환
 * 노선 목록과 역 목록도 함께 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSampleData, generateMonthlyData } from '@/lib/sampleData';
import { getDataSummary } from '@/lib/analytics';
import { SubwayUsageData } from '@/lib/types';

// 데이터 캐싱 - 년월별 캐싱
const dataCache = new Map<string, ReturnType<typeof generateSampleData>>();

function getData(year?: number, month?: number) {
  const cacheKey = year && month ? `${year}-${month}` : 'default';
  
  if (!dataCache.has(cacheKey)) {
    const data = year && month ? generateMonthlyData(year, month) : generateSampleData();
    dataCache.set(cacheKey, data);
  }
  
  return dataCache.get(cacheKey)!;
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
    
    const data = getData(year, month);
    const summary = getDataSummary(data);
    const lineList = getLineList(data);
    const stationList = getStationList(data);
    
    return NextResponse.json({
      ...summary,
      lineList,
      stationList,
      year,
      month,
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
