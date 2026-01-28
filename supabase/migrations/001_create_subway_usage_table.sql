-- ============================================
-- 지하철 이용객 마스터 테이블 (subway_usage)
-- ============================================
-- 작성일: 2026-01-28
-- 설명: 지하철 역별 일자별 승하차 이용객 데이터를 저장하는 테이블
-- ============================================

-- 기존 테이블/타입이 있으면 삭제 (개발 환경용, 운영에서는 주석 처리)
-- DROP TABLE IF EXISTS subway_usage CASCADE;
-- DROP TYPE IF EXISTS holiday_type CASCADE;

-- ============================================
-- 1. ENUM 타입 정의
-- ============================================

-- 휴일여부 타입 정의
DO $$ BEGIN
    CREATE TYPE holiday_type AS ENUM ('평일', '토요일', '일요일', '공휴일');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS subway_usage (
    -- 기본 키
    id BIGSERIAL PRIMARY KEY,
    
    -- 사용일자: 이용한 날짜
    usage_date DATE NOT NULL,
    
    -- 휴일여부: 평일, 공휴일, 토요일, 일요일 구분
    holiday_type holiday_type NOT NULL,
    
    -- 노선명: 지하철 노선명
    line_name VARCHAR(50) NOT NULL,
    
    -- 역명: 지하철 역명
    station_name VARCHAR(100) NOT NULL,
    
    -- 승차고객수: 해당일 승차 고객수
    boarding_count INTEGER NOT NULL DEFAULT 0,
    
    -- 하차고객수: 해당일 하차 고객수
    alighting_count INTEGER NOT NULL DEFAULT 0,
    
    -- 데이터 출처: 데이터를 가져온 출처
    -- sample: 샘플데이터, seoul_opendata: 서울열린데이터광장, public_data: 공공데이터포털
    data_source VARCHAR(100) NOT NULL DEFAULT 'sample',
    
    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),  -- 데이터 INSERT 일시
    updated_at TIMESTAMPTZ DEFAULT NOW(),  -- 데이터 최종 수정 일시
    
    -- 복합 유니크 제약조건: 날짜 + 노선 + 역명 조합은 고유해야 함
    CONSTRAINT unique_usage_per_station_date UNIQUE (usage_date, line_name, station_name)
);

-- ============================================
-- 3. 인덱스 생성 (조회 성능 최적화)
-- ============================================

-- 날짜 기반 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_subway_usage_date ON subway_usage(usage_date);

-- 노선명 기반 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_subway_usage_line ON subway_usage(line_name);

-- 역명 기반 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_subway_usage_station ON subway_usage(station_name);

-- 휴일여부 기반 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_subway_usage_holiday ON subway_usage(holiday_type);

-- 데이터 출처 기반 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_subway_usage_source ON subway_usage(data_source);

-- 복합 인덱스: 날짜 + 휴일여부 (평일/주말 분석용)
CREATE INDEX IF NOT EXISTS idx_subway_usage_date_holiday ON subway_usage(usage_date, holiday_type);

-- 복합 인덱스: 노선 + 역명 (특정 역 조회용)
CREATE INDEX IF NOT EXISTS idx_subway_usage_line_station ON subway_usage(line_name, station_name);

-- ============================================
-- 4. 트리거 함수 (updated_at 자동 갱신)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성 (이미 존재하면 재생성)
DROP TRIGGER IF EXISTS update_subway_usage_updated_at ON subway_usage;
CREATE TRIGGER update_subway_usage_updated_at
    BEFORE UPDATE ON subway_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 테이블/컬럼 코멘트
-- ============================================

COMMENT ON TABLE subway_usage IS '지하철 이용객 마스터 테이블 - 역별 일자별 승하차 데이터';
COMMENT ON COLUMN subway_usage.id IS '고유 식별자 (자동 생성)';
COMMENT ON COLUMN subway_usage.usage_date IS '사용일자: 이용한 날짜';
COMMENT ON COLUMN subway_usage.holiday_type IS '휴일여부: 평일, 토요일, 일요일, 공휴일';
COMMENT ON COLUMN subway_usage.line_name IS '노선명: 지하철 노선명 (예: 1호선, 2호선)';
COMMENT ON COLUMN subway_usage.station_name IS '역명: 지하철 역명 (예: 강남, 서울역)';
COMMENT ON COLUMN subway_usage.boarding_count IS '승차고객수: 해당일 승차 고객수';
COMMENT ON COLUMN subway_usage.alighting_count IS '하차고객수: 해당일 하차 고객수';
COMMENT ON COLUMN subway_usage.data_source IS '데이터 출처: sample(샘플), seoul_opendata(서울열린데이터), public_data(공공데이터포털)';
COMMENT ON COLUMN subway_usage.created_at IS '데이터 INSERT 일시: 행이 DB에 삽입된 시간';
COMMENT ON COLUMN subway_usage.updated_at IS '데이터 최종 수정 일시: 마지막으로 수정된 시간';

-- ============================================
-- 6. Row Level Security (RLS) 설정
-- ============================================

-- RLS 비활성화 (공개 데이터이므로 모든 접근 허용)
-- 보안이 필요한 경우 아래 RLS 정책 사용
ALTER TABLE subway_usage DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS 정책 (보안이 필요한 경우 사용)
-- ============================================
-- 아래 정책은 RLS 활성화 시 사용
-- ALTER TABLE subway_usage ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Allow public read" ON subway_usage;
DROP POLICY IF EXISTS "Allow public insert" ON subway_usage;
DROP POLICY IF EXISTS "Allow public update" ON subway_usage;
DROP POLICY IF EXISTS "Allow public delete" ON subway_usage;

-- SELECT 정책: 모든 사용자 읽기 가능
CREATE POLICY "Allow public read" ON subway_usage
    FOR SELECT USING (true);

-- INSERT 정책: 모든 사용자 쓰기 가능
CREATE POLICY "Allow public insert" ON subway_usage
    FOR INSERT WITH CHECK (true);

-- UPDATE 정책: 모든 사용자 수정 가능
CREATE POLICY "Allow public update" ON subway_usage
    FOR UPDATE USING (true);

-- DELETE 정책: 모든 사용자 삭제 가능
CREATE POLICY "Allow public delete" ON subway_usage
    FOR DELETE USING (true);

-- ============================================
-- 8. 기존 테이블에 컬럼 추가 (마이그레이션용)
-- ============================================
-- 이미 테이블이 있고 data_source 컬럼만 추가해야 하는 경우:
-- ALTER TABLE subway_usage 
-- ADD COLUMN IF NOT EXISTS data_source VARCHAR(100) NOT NULL DEFAULT 'sample';

-- ============================================
-- 완료
-- ============================================
