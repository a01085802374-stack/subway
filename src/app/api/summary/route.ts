/**
 * 데이터 요약 정보 조회 API
 * 
 * GET /api/summary
 * 데이터 범위, 역 수, 노선 수 등 요약 정보를 반환
 */

import { NextResponse } from 'next/server';
import { generateSampleData } from '@/lib/sampleData';
import { getDataSummary } from '@/lib/analytics';

// 데이터 캐싱
let cachedData: ReturnType<typeof generateSampleData> | null = null;

function getData() {
  if (!cachedData) {
    cachedData = generateSampleData();
  }
  return cachedData;
}

export async function GET() {
  try {
    const data = getData();
    const summary = getDataSummary(data);
    
    return NextResponse.json({
      ...summary,
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
