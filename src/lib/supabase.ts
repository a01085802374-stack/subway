/**
 * Supabase 클라이언트 설정
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// 환경 변수에서 Supabase 설정 읽기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성 (서버 사이드용)
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 샘플 데이터를 사용합니다.');
    return null;
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // 서버 사이드에서는 세션 유지 불필요
    },
  });
}

// 싱글톤 패턴으로 클라이언트 재사용
let supabaseClient: ReturnType<typeof createSupabaseClient> = null;

export function getSupabaseClient() {
  if (supabaseClient === null) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// Supabase 연결 상태 확인
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// 서비스 역할 키를 사용하는 Admin 클라이언트 (서버 전용, 더 높은 권한)
export function getSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase Admin 환경 변수가 설정되지 않았습니다.');
    return null;
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
