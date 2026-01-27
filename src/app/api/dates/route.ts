/**
 * 날짜 분류 정보 조회 API
 * 
 * GET /api/dates
 * 최근 30일의 날짜별 평일/주말/공휴일 분류 정보를 반환
 */

import { NextResponse } from 'next/server';
import { getRecentDates, getDateClassification } from '@/lib/holidays';

export async function GET() {
  try {
    const dates = getRecentDates(30);
    const classifications = dates.map(date => getDateClassification(date));
    
    const summary = {
      total: classifications.length,
      weekdays: classifications.filter(d => d.isWeekday).length,
      weekends: classifications.filter(d => d.isWeekend && !d.isHoliday).length,
      holidays: classifications.filter(d => d.isHoliday).length,
    };
    
    return NextResponse.json({
      summary,
      dates: classifications,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dates API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
