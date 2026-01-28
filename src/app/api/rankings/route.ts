/**
 * 랭킹 조회 API
 * 
 * GET /api/rankings
 * Query Parameters:
 *   - dayType: 'weekday' | 'weekend_holiday' | 'overall'
 *   - metricType: 'boarding' | 'alighting'
 *   - rankType: 'top' | 'bottom'
 *   - limit: number (기본값: 30)
 *   - year: number (년도, 선택)
 *   - month: number (월 1-12, 선택)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSampleData, generateMonthlyData } from '@/lib/sampleData';
import { analyzeData, getRanking, getRankingTitle } from '@/lib/analytics';
import { DayType, MetricType, RankType, RankingResponse } from '@/lib/types';

// 동적 라우트로 설정 (정적 생성 방지)
export const dynamic = 'force-dynamic';

// 데이터 캐싱 (서버 측에서 재생성 방지) - 년월별 캐싱
const dataCache = new Map<string, ReturnType<typeof generateSampleData>>();
const analysisCache = new Map<string, ReturnType<typeof analyzeData>>();

function getAnalysis(year?: number, month?: number) {
  const cacheKey = year && month ? `${year}-${month}` : 'default';
  
  if (!dataCache.has(cacheKey)) {
    const data = year && month ? generateMonthlyData(year, month) : generateSampleData();
    dataCache.set(cacheKey, data);
  }
  
  if (!analysisCache.has(cacheKey)) {
    const data = dataCache.get(cacheKey)!;
    analysisCache.set(cacheKey, analyzeData(data));
  }
  
  return analysisCache.get(cacheKey)!;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 쿼리 파라미터 추출 및 검증
    const dayType = searchParams.get('dayType') as DayType | null;
    const metricType = searchParams.get('metricType') as MetricType | null;
    const rankType = searchParams.get('rankType') as RankType | null;
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 30;
    
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
    const analysis = getAnalysis(year, month);
    
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
