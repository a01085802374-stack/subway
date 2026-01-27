/**
 * 랭킹 카테고리 목록 조회 API
 * 
 * GET /api/categories
 * 모든 가능한 랭킹 카테고리 목록을 반환
 */

import { NextResponse } from 'next/server';
import { getAllRankingCategories } from '@/lib/analytics';

export async function GET() {
  try {
    const categories = getAllRankingCategories();
    
    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
