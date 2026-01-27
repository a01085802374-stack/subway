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
 * 역 목록 추출 (가나다순 정렬)
 */
function getStationList(data: SubwayUsageData[]): Array<{ name: string; lines: string[] }> {
  const stationMap = new Map<string, Set<string>>();
  
  for (const record of data) {
    if (!stationMap.has(record.stationName)) {
      stationMap.set(record.stationName, new Set());
    }
    stationMap.get(record.stationName)!.add(record.lineName);
  }
  
  const stations = Array.from(stationMap.entries()).map(([name, lines]) => ({
    name,
    lines: Array.from(lines).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '')) || 999;
      const numB = parseInt(b.replace(/[^0-9]/g, '')) || 999;
      return numA - numB;
    }),
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
