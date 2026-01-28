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
 * 
 * 데이터 소스:
 *   - Supabase DB에 데이터가 있으면 DB 데이터 사용
 *   - DB에 데이터가 없거나 Supabase 미설정 시 샘플 데이터 사용
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSampleData, generateMonthlyData } from '@/lib/sampleData';
import { analyzeData, getRanking, getRankingTitle } from '@/lib/analytics';
import { DayType, MetricType, RankType, RankingResponse, SubwayUsageData } from '@/lib/types';
import { getSubwayUsageByMonth, getSubwayUsageByPeriod, shouldUseSampleData, saveSubwayUsageData } from '@/lib/subwayUsageService';
import { isSupabaseConfigured } from '@/lib/supabase';

// 동적 라우트로 설정 (정적 생성 방지)
export const dynamic = 'force-dynamic';

// 샘플 데이터 캐싱 (서버 측에서 재생성 방지) - 년월별 캐싱
const sampleDataCache = new Map<string, SubwayUsageData[]>();
const analysisCache = new Map<string, ReturnType<typeof analyzeData>>();

/**
 * 데이터 가져오기 (DB 우선, 없으면 자동으로 DB에 저장 후 반환)
 */
async function getData(year?: number, month?: number): Promise<SubwayUsageData[]> {
  const cacheKey = year && month ? `${year}-${month}` : 'default';
  
  // Supabase가 설정되어 있는 경우
  if (isSupabaseConfigured()) {
    const useSample = await shouldUseSampleData(year, month);
    
    if (!useSample) {
      // DB에 데이터가 있으면 DB에서 조회
      if (year && month) {
        return await getSubwayUsageByMonth(year, month);
      } else {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        return await getSubwayUsageByPeriod(startDate, endDate);
      }
    } else {
      // DB에 데이터가 없으면 샘플 데이터를 생성하여 DB에 저장
      console.log(`[Auto-Sync] DB에 데이터 없음. 자동 저장 시작: ${year || 'recent'}-${month || '30days'}`);
      
      const sampleData = year && month ? generateMonthlyData(year, month) : generateSampleData();
      
      // DB에 저장 (완료될 때까지 대기)
      try {
        const result = await saveSubwayUsageData(sampleData, 'sample');
        console.log(`[Auto-Sync] 저장 완료: inserted=${result.inserted}, skipped=${result.skipped}, errors=${result.errors.length}`);
        if (result.errors.length > 0) {
          console.error('[Auto-Sync] 저장 오류:', result.errors);
        }
      } catch (err) {
        console.error('[Auto-Sync] 저장 실패:', err);
      }
      
      // 저장 완료 후 샘플 데이터 반환
      return sampleData;
    }
  }
  
  // Supabase 미설정 시 샘플 데이터 사용 (캐시 활용)
  if (!sampleDataCache.has(cacheKey)) {
    const data = year && month ? generateMonthlyData(year, month) : generateSampleData();
    sampleDataCache.set(cacheKey, data);
  }
  
  return sampleDataCache.get(cacheKey)!;
}

/**
 * 분석 결과 가져오기 (캐싱 적용)
 */
async function getAnalysis(year?: number, month?: number) {
  const cacheKey = year && month ? `${year}-${month}` : 'default';
  
  // DB 데이터 사용 시 캐시를 사용하지 않음 (데이터 변경 가능성)
  if (isSupabaseConfigured()) {
    const useSample = await shouldUseSampleData(year, month);
    if (!useSample) {
      const data = await getData(year, month);
      return analyzeData(data);
    }
  }
  
  // 샘플 데이터의 경우 캐시 사용
  if (!analysisCache.has(cacheKey)) {
    const data = await getData(year, month);
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
    const analysis = await getAnalysis(year, month);
    
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
