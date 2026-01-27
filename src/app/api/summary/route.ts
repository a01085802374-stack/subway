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
 * 역 목록 추출 (가나다순 정렬) - 전체 기간 평균 승/하차 인원 포함
 */
function getStationList(data: SubwayUsageData[]): Array<{ 
  name: string; 
  lines: string[];
  avgBoarding: number;
  avgAlighting: number;
}> {
  // 역별 데이터 집계
  const stationMap = new Map<string, {
    lines: Set<string>;
    totalBoarding: number;
    totalAlighting: number;
    count: number;
  }>();
  
  for (const record of data) {
    if (!stationMap.has(record.stationName)) {
      stationMap.set(record.stationName, {
        lines: new Set(),
        totalBoarding: 0,
        totalAlighting: 0,
        count: 0,
      });
    }
    const station = stationMap.get(record.stationName)!;
    station.lines.add(record.lineName);
    station.totalBoarding += record.boardingCount;
    station.totalAlighting += record.alightingCount;
    station.count += 1;
  }
  
  const stations = Array.from(stationMap.entries()).map(([name, data]) => ({
    name,
    lines: Array.from(data.lines).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '')) || 999;
      const numB = parseInt(b.replace(/[^0-9]/g, '')) || 999;
      return numA - numB;
    }),
    // 일평균 계산 (모든 노선 합산 후 날짜 수로 나눔)
    avgBoarding: Math.round(data.totalBoarding / (data.count / data.lines.size)),
    avgAlighting: Math.round(data.totalAlighting / (data.count / data.lines.size)),
  }));
  
  // 가나다순 정렬
  return stations.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
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
