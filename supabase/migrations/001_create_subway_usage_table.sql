-- 지하철 이용객 마스터 테이블
-- 테이블명: subway_usage

-- 휴일여부 타입 정의
CREATE TYPE holiday_type AS ENUM ('평일', '토요일', '일요일', '공휴일');

-- 지하철 이용객 마스터 테이블 생성
CREATE TABLE IF NOT EXISTS subway_usage (
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
    
    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 복합 유니크 제약조건: 날짜 + 노선 + 역명 조합은 고유해야 함
    CONSTRAINT unique_usage_per_station_date UNIQUE (usage_date, line_name, station_name)
);

-- 인덱스 생성 (조회 성능 최적화)

-- 날짜 기반 조회용 인덱스
CREATE INDEX idx_subway_usage_date ON subway_usage(usage_date);

-- 노선명 기반 조회용 인덱스
CREATE INDEX idx_subway_usage_line ON subway_usage(line_name);

-- 역명 기반 조회용 인덱스
CREATE INDEX idx_subway_usage_station ON subway_usage(station_name);

-- 휴일여부 기반 조회용 인덱스
CREATE INDEX idx_subway_usage_holiday ON subway_usage(holiday_type);

-- 복합 인덱스: 날짜 + 휴일여부 (평일/주말 분석용)
CREATE INDEX idx_subway_usage_date_holiday ON subway_usage(usage_date, holiday_type);

-- 복합 인덱스: 노선 + 역명 (특정 역 조회용)
CREATE INDEX idx_subway_usage_line_station ON subway_usage(line_name, station_name);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subway_usage_updated_at
    BEFORE UPDATE ON subway_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE subway_usage IS '지하철 이용객 마스터 테이블';
COMMENT ON COLUMN subway_usage.usage_date IS '이용한 날짜 (사용일자)';
COMMENT ON COLUMN subway_usage.holiday_type IS '휴일여부: 평일, 공휴일, 토요일, 일요일';
COMMENT ON COLUMN subway_usage.line_name IS '지하철 노선명';
COMMENT ON COLUMN subway_usage.station_name IS '지하철 역명';
COMMENT ON COLUMN subway_usage.boarding_count IS '해당일 승차 고객수';
COMMENT ON COLUMN subway_usage.alighting_count IS '해당일 하차 고객수';
COMMENT ON COLUMN subway_usage.created_at IS '데이터 INSERT 일시 (행이 생성된 시간)';
COMMENT ON COLUMN subway_usage.updated_at IS '데이터 최종 수정 일시';

-- RLS (Row Level Security) 정책 설정 (선택적)
-- ALTER TABLE subway_usage ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능한 정책 (공개 데이터인 경우)
-- CREATE POLICY "Anyone can read subway_usage" ON subway_usage
--     FOR SELECT USING (true);

-- 인증된 사용자만 쓰기 가능한 정책
-- CREATE POLICY "Authenticated users can insert subway_usage" ON subway_usage
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
