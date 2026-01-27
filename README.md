# 지하철 이용객 분석 서비스

대한민국 지하철역 이용객 데이터를 최근 30일 기준으로 분석·조회하는 웹 서비스입니다.

## 주요 기능

- **평일/주말·공휴일 분류**: 법정 공휴일을 포함한 날짜 분류
- **평균 계산**: 평일 평균, 주말·공휴일 평균, 전체 평균 산출
- **TOP/BOTTOM 랭킹**: 승차/하차 인원 기준 상위/하위 30개 역 조회
- **정렬 기능**: 테이블 헤더 클릭으로 정렬 변경

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Deployment**: Vercel

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── rankings/route.ts    # 랭킹 조회 API
│   │   ├── categories/route.ts  # 카테고리 목록 API
│   │   ├── summary/route.ts     # 데이터 요약 API
│   │   └── dates/route.ts       # 날짜 분류 API
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 레이아웃
│   └── page.tsx                 # 메인 페이지
├── components/
│   ├── RankingTable.tsx         # 랭킹 테이블 컴포넌트
│   ├── CategorySelector.tsx     # 조회 조건 선택
│   ├── DataSummary.tsx          # 데이터 요약 표시
│   └── LoadingSpinner.tsx       # 로딩 스피너
└── lib/
    ├── types.ts                 # TypeScript 타입 정의
    ├── holidays.ts              # 공휴일 판단 로직
    ├── sampleData.ts            # 샘플 데이터 생성
    └── analytics.ts             # 데이터 분석 로직
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 환경 변수 (선택 사항)

실제 지하철 데이터 API 연동 시 필요한 환경 변수:

```env
# 서울 열린데이터 광장 API 키
SEOUL_METRO_API_KEY=your_api_key_here

# 공공데이터 포털 공휴일 API 키
HOLIDAY_API_KEY=your_holiday_api_key_here
```

현재는 샘플 데이터와 내부 공휴일 테이블을 사용하므로 환경 변수 없이 동작합니다.

## API 문서

### GET /api/rankings

랭킹 데이터를 조회합니다.

**Query Parameters:**
- `dayType` (required): `weekday` | `weekend_holiday` | `overall`
- `metricType` (required): `boarding` | `alighting`
- `rankType` (required): `top` | `bottom`
- `limit` (optional): 조회 개수 (기본값: 30, 최대: 100)

**Response:**
```json
{
  "title": "평일 평균 승차 TOP 30",
  "data": [
    {
      "rank": 1,
      "stationName": "강남",
      "lineName": "2호선",
      "count": 120000
    }
  ],
  "dayType": "weekday",
  "metricType": "boarding",
  "rankType": "top",
  "generatedAt": "2026-01-27T00:00:00.000Z"
}
```

### GET /api/summary

데이터 요약 정보를 조회합니다.

### GET /api/categories

모든 랭킹 카테고리 목록을 조회합니다.

### GET /api/dates

최근 30일의 날짜별 평일/주말/공휴일 분류 정보를 조회합니다.

## 분석 로직

### 날짜 분류

```typescript
// 평일: 월~금 중 공휴일이 아닌 날
function isWeekday(date: Date | string): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

// 주말·공휴일: 토, 일 또는 법정 공휴일
function isWeekendOrHoliday(date: Date | string): boolean {
  return isWeekend(date) || isHoliday(date);
}
```

### 평균 계산

```typescript
// 역별로 데이터를 집계하여 평균 계산
평균 = Σ(일별 인원수) / 집계 일수
```

### 랭킹 산출

```typescript
// TOP: 내림차순 정렬 후 상위 N개
// BOTTOM: 오름차순 정렬 후 상위 N개
```

## Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정 (필요 시)
4. 배포 완료

## 확장 아이디어

1. **실제 API 연동**: 서울 열린데이터 광장 지하철 승하차 API 연동
2. **차트 시각화**: Chart.js 또는 Recharts로 그래프 추가
3. **역 검색 기능**: 특정 역 검색 및 상세 통계 조회
4. **기간 선택**: 30일 외 다른 기간 선택 기능
5. **노선별 필터링**: 특정 노선만 조회하는 필터
6. **데이터 내보내기**: CSV/Excel 다운로드 기능
7. **알림 기능**: 특정 역의 이용객 변화 알림
8. **다크 모드**: 시스템 설정 기반 테마 전환 (이미 지원)

## 라이선스

MIT License
