/**
 * 대한민국 법정 공휴일 데이터 및 관련 유틸리티
 * 
 * 공휴일 판단 방법:
 * 1. 내부 공휴일 테이블 사용 (기본)
 * 2. 공공데이터 포털 API 사용 (선택적 - API 키 필요)
 */

// 2025-2026년 대한민국 법정 공휴일 (고정 공휴일 + 음력 공휴일)
// 실제 서비스에서는 매년 업데이트하거나 API로 조회
const KOREAN_HOLIDAYS: Record<string, string> = {
  // 2025년 공휴일
  '2025-01-01': '신정',
  '2025-01-28': '설날 연휴',
  '2025-01-29': '설날',
  '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절',
  '2025-05-05': '어린이날',
  '2025-05-06': '부처님오신날',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-03': '개천절',
  '2025-10-05': '추석 연휴',
  '2025-10-06': '추석',
  '2025-10-07': '추석 연휴',
  '2025-10-09': '한글날',
  '2025-12-25': '크리스마스',
  
  // 2026년 공휴일
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-03-02': '삼일절 대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '부처님오신날 대체공휴일',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-08-17': '광복절 대체공휴일',
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-05': '개천절 대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '크리스마스',
};

/**
 * 특정 날짜가 공휴일인지 확인
 * @param date - 확인할 날짜 (Date 또는 'YYYY-MM-DD' 문자열)
 * @returns 공휴일 여부
 */
export function isHoliday(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : formatDate(date);
  return dateStr in KOREAN_HOLIDAYS;
}

/**
 * 공휴일 이름 조회
 * @param date - 조회할 날짜
 * @returns 공휴일 이름 또는 null
 */
export function getHolidayName(date: Date | string): string | null {
  const dateStr = typeof date === 'string' ? date : formatDate(date);
  return KOREAN_HOLIDAYS[dateStr] || null;
}

/**
 * 특정 날짜가 주말인지 확인
 * @param date - 확인할 날짜
 * @returns 주말(토,일) 여부
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = d.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0: 일요일, 6: 토요일
}

/**
 * 특정 날짜가 평일인지 확인 (주말도 아니고 공휴일도 아님)
 * @param date - 확인할 날짜
 * @returns 평일 여부
 */
export function isWeekday(date: Date | string): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

/**
 * 특정 날짜가 주말 또는 공휴일인지 확인
 * @param date - 확인할 날짜
 * @returns 주말 또는 공휴일 여부
 */
export function isWeekendOrHoliday(date: Date | string): boolean {
  return isWeekend(date) || isHoliday(date);
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 * @param date - 변환할 날짜
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 최근 N일간의 날짜 배열 생성
 * @param days - 일수 (기본값: 30)
 * @param endDate - 종료 날짜 (기본값: 오늘)
 * @returns 날짜 문자열 배열 (YYYY-MM-DD)
 */
export function getRecentDates(days: number = 30, endDate: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

/**
 * 날짜 배열을 평일/주말·공휴일로 분류
 * @param dates - 날짜 배열
 * @returns 분류된 날짜 객체
 */
export function classifyDates(dates: string[]): {
  weekdays: string[];
  weekendsAndHolidays: string[];
} {
  const weekdays: string[] = [];
  const weekendsAndHolidays: string[] = [];

  for (const date of dates) {
    if (isWeekday(date)) {
      weekdays.push(date);
    } else {
      weekendsAndHolidays.push(date);
    }
  }

  return { weekdays, weekendsAndHolidays };
}

/**
 * 날짜 분류 정보 반환 (디버깅/표시용)
 * @param date - 날짜
 * @returns 분류 정보
 */
export function getDateClassification(date: Date | string): {
  date: string;
  dayOfWeek: string;
  isWeekday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  classification: '평일' | '주말' | '공휴일' | '주말·공휴일';
} {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = typeof date === 'string' ? date : formatDate(date);
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const weekend = isWeekend(d);
  const holiday = isHoliday(dateStr);
  const holidayName = getHolidayName(dateStr);

  let classification: '평일' | '주말' | '공휴일' | '주말·공휴일';
  if (weekend && holiday) {
    classification = '주말·공휴일';
  } else if (weekend) {
    classification = '주말';
  } else if (holiday) {
    classification = '공휴일';
  } else {
    classification = '평일';
  }

  return {
    date: dateStr,
    dayOfWeek: dayNames[d.getDay()],
    isWeekday: !weekend && !holiday,
    isWeekend: weekend,
    isHoliday: holiday,
    holidayName,
    classification,
  };
}
