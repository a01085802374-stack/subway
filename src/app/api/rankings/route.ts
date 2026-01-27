/**
 * 랭킹 조회 API
 * 
 * GET /api/rankings
 * Query Parameters:
 *   - dayType: 'weekday' | 'weekend_holiday' | 'overall'
 *   - metricType: 'boarding' | 'alighting'
 *   - rankType: 'top' | 'bottom'
 *   - limit: number (기본값: 30)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSampleData } from '@/lib/sampleData';
import { analyzeData, getRanking, getRankingTitle } from '@/lib/analytics';
import { DayType, MetricType, RankType, RankingResponse } from '@/lib/types';

// 데이터 캐싱 (서버 측에서 재생성 방지)
let cachedData: ReturnType<typeof generateSampleData> | null = null;
let cachedAnalysis: ReturnType<typeof analyzeData> | null = null;

function getAnalysis() {
  if (!cachedData) {
    cachedData = generateSampleData();
  }
  if (!cachedAnalysis) {
    cachedAnalysis = analyzeData(cachedData);
  }
  return cachedAnalysis;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 추출 및 검증
    const dayType = searchParams.get('dayType') as DayType | null;
    const metricType = searchParams.get('metricType') as MetricType | null;
    const rankType = searchParams.get('rankType') as RankType | null;
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 30;

    // 필수 파라미터 검증
    if (!dayType || !['weekday', 'weekend_holiday', 'overall'].includes(dayType)) {
      return NextResponse.json(
        { error: 'Invalid or missing dayType parameter. Valid values: weekday, weekend_holiday, overall' },
        { status: 400 }
      );
    }

    if (!metricType || !['boarding', 'alighting'].includes(metricType)) {
      return NextResponse.json(
        { error: 'Invalid or missing metricType parameter. Valid values: boarding, alighting' },
        { status: 400 }
      );
    }

    if (!rankType || !['top', 'bottom'].includes(rankType)) {
      return NextResponse.json(
        { error: 'Invalid or missing rankType parameter. Valid values: top, bottom' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    // 분석 데이터 조회
    const analysis = getAnalysis();
    
    // 랭킹 생성
    const rankingData = getRanking(analysis, dayType, metricType, rankType, limit);
    const title = getRankingTitle(dayType, metricType, rankType, limit);

    const response: RankingResponse = {
      title,
      data: rankingData,
      dayType,
      metricType,
      rankType,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Rankings API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
