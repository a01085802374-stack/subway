/**
 * 데이터 요약 정보 조회 API
 * 
 * GET /api/summary
 * 데이터 범위, 역 수, 노선 수 등 요약 정보를 반환
 * 노선 목록과 역 목록도 함께 반환
 */

import { NextResponse } from 'next/server';
import { generateSampleData } from '@/lib/sampleData';
import { getDataSummary } from '@/lib/analytics';
import { SubwayUsageData } from '@/lib/types';

// 데이터 캐싱
let cachedData: ReturnType<typeof generateSampleData> | null = null;

function getData() {
  if (!cachedData) {
    cachedData = generateSampleData();
  }
  return cachedData;
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
 */
function getStationList(data: SubwayUsageData[]): Array<{ 
  name: string; 
  line: string;
  avgBoarding: number;
  avgAlighting: number;
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
  
  const stations = Array.from(stationLineMap.values()).map((data) => ({
    name: data.name,
    line: data.line,
    // 일평균 계산
    avgBoarding: Math.round(data.totalBoarding / data.count),
    avgAlighting: Math.round(data.totalAlighting / data.count),
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

export async function GET() {
  try {
    const data = getData();
    const summary = getDataSummary(data);
    const lineList = getLineList(data);
    const stationList = getStationList(data);
    
    return NextResponse.json({
      ...summary,
      lineList,
      stationList,
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
