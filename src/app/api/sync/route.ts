/**
 * 데이터 동기화 API
 * 
 * POST /api/sync
 * Body:
 *   - year: number (년도)
 *   - month: number (월 1-12)
 *   - forceGenerate?: boolean (샘플 데이터 강제 생성 여부)
 * 
 * 기능:
 * - 지정된 기간의 샘플 데이터를 생성하여 DB에 저장
 * - 이미 존재하는 데이터는 스킵 (기존 데이터 유지)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { saveSubwayUsageData } from '@/lib/subwayUsageService';
import { generateMonthlyData, generateSampleData } from '@/lib/sampleData';

// 동적 라우트 설정
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Supabase 설정 확인
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { 
          error: 'Supabase가 설정되지 않았습니다.',
          message: 'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수를 설정해주세요.'
        },
        { status: 503 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { year, month, forceGenerate = false } = body;

    // 파라미터 검증
    if (year !== undefined || month !== undefined) {
      if (!year || !month) {
        return NextResponse.json(
          { error: 'year와 month는 함께 제공되어야 합니다.' },
          { status: 400 }
        );
      }

      if (year < 2025 || year > 2026) {
        return NextResponse.json(
          { error: '유효하지 않은 연도입니다. 2025 또는 2026만 가능합니다.' },
          { status: 400 }
        );
      }

      if (month < 1 || month > 12) {
        return NextResponse.json(
          { error: '유효하지 않은 월입니다. 1-12 사이의 값을 입력해주세요.' },
          { status: 400 }
        );
      }
    }

    // 샘플 데이터 생성
    const data = year && month 
      ? generateMonthlyData(year, month)
      : generateSampleData();

    // DB에 저장 (upsert 로직: 기존 데이터는 스킵)
    const result = await saveSubwayUsageData(data);

    // 결과 반환
    return NextResponse.json({
      success: true,
      message: year && month 
        ? `${year}년 ${month}월 데이터 동기화 완료`
        : '최근 30일 데이터 동기화 완료',
      stats: {
        total: data.length,
        inserted: result.inserted,
        skipped: result.skipped,
        errors: result.errors.length,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Sync API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET 메서드도 지원 (동기화 상태 확인용)
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    supabaseConfigured: isSupabaseConfigured(),
    supportedOperations: {
      POST: {
        description: '샘플 데이터를 DB에 동기화',
        parameters: {
          year: 'number (optional, 2025-2026)',
          month: 'number (optional, 1-12)',
          forceGenerate: 'boolean (optional, default: false)',
        },
        examples: [
          { description: '2025년 1월 데이터 동기화', body: { year: 2025, month: 1 } },
          { description: '최근 30일 데이터 동기화', body: {} },
        ],
      },
    },
  });
}
