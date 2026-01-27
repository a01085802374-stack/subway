/**
 * 지하철역 샘플 데이터 생성
 * 
 * 실제 서비스에서는 서울 열린데이터 광장 API 또는 공공데이터 포털에서 조회
 * 여기서는 현실적인 패턴을 반영한 샘플 데이터를 생성
 */

import { SubwayUsageData } from './types';
import { getRecentDates, isWeekday } from './holidays';

// 서울 지하철 주요역 정보 (실제 역 기준)
const SEOUL_METRO_STATIONS = [
  // 1호선
  { name: '서울역', line: '1호선', baseBoarding: 85000, baseAlighting: 82000 },
  { name: '시청', line: '1호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '종각', line: '1호선', baseBoarding: 55000, baseAlighting: 53000 },
  { name: '종로3가', line: '1호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '동대문', line: '1호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '신설동', line: '1호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '용산', line: '1호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '영등포', line: '1호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '구로', line: '1호선', baseBoarding: 38000, baseAlighting: 37000 },
  
  // 2호선 (순환선)
  { name: '강남', line: '2호선', baseBoarding: 120000, baseAlighting: 118000 },
  { name: '삼성', line: '2호선', baseBoarding: 75000, baseAlighting: 73000 },
  { name: '선릉', line: '2호선', baseBoarding: 65000, baseAlighting: 64000 },
  { name: '역삼', line: '2호선', baseBoarding: 68000, baseAlighting: 67000 },
  { name: '교대', line: '2호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '서초', line: '2호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '방배', line: '2호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '사당', line: '2호선', baseBoarding: 52000, baseAlighting: 51000 },
  { name: '신림', line: '2호선', baseBoarding: 58000, baseAlighting: 57000 },
  { name: '서울대입구', line: '2호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '신대방', line: '2호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '구로디지털단지', line: '2호선', baseBoarding: 72000, baseAlighting: 71000 },
  { name: '대림', line: '2호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '신도림', line: '2호선', baseBoarding: 95000, baseAlighting: 93000 },
  { name: '영등포구청', line: '2호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '당산', line: '2호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '합정', line: '2호선', baseBoarding: 52000, baseAlighting: 51000 },
  { name: '홍대입구', line: '2호선', baseBoarding: 88000, baseAlighting: 86000 },
  { name: '신촌', line: '2호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '이대', line: '2호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '아현', line: '2호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '충정로', line: '2호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '을지로입구', line: '2호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '을지로3가', line: '2호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '을지로4가', line: '2호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '동대문역사문화공원', line: '2호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '신당', line: '2호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '상왕십리', line: '2호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '왕십리', line: '2호선', baseBoarding: 58000, baseAlighting: 57000 },
  { name: '한양대', line: '2호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '뚝섬', line: '2호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '성수', line: '2호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '건대입구', line: '2호선', baseBoarding: 62000, baseAlighting: 61000 },
  { name: '구의', line: '2호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '강변', line: '2호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '잠실나루', line: '2호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '잠실', line: '2호선', baseBoarding: 78000, baseAlighting: 76000 },
  { name: '종합운동장', line: '2호선', baseBoarding: 32000, baseAlighting: 31000 },
  
  // 3호선
  { name: '경복궁', line: '3호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '안국', line: '3호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '종로3가', line: '3호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '압구정', line: '3호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '신사', line: '3호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '고속터미널', line: '3호선', baseBoarding: 72000, baseAlighting: 71000 },
  { name: '남부터미널', line: '3호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '양재', line: '3호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '매봉', line: '3호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '도곡', line: '3호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '대치', line: '3호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '학여울', line: '3호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '대청', line: '3호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '일원', line: '3호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '수서', line: '3호선', baseBoarding: 32000, baseAlighting: 31000 },
  
  // 4호선
  { name: '명동', line: '4호선', baseBoarding: 55000, baseAlighting: 54000 },
  { name: '충무로', line: '4호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '동대문', line: '4호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '혜화', line: '4호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '한성대입구', line: '4호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '성신여대입구', line: '4호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '길음', line: '4호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '미아사거리', line: '4호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '수유', line: '4호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '쌍문', line: '4호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '창동', line: '4호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '노원', line: '4호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '사당', line: '4호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '이수', line: '4호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '동작', line: '4호선', baseBoarding: 28000, baseAlighting: 27000 },
  
  // 5호선
  { name: '광화문', line: '5호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '종로3가', line: '5호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '동대문역사문화공원', line: '5호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '청구', line: '5호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '신금호', line: '5호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '왕십리', line: '5호선', baseBoarding: 52000, baseAlighting: 51000 },
  { name: '마장', line: '5호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '답십리', line: '5호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '장한평', line: '5호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '군자', line: '5호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '아차산', line: '5호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '광나루', line: '5호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '천호', line: '5호선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '강동', line: '5호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '길동', line: '5호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '굽은다리', line: '5호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '명일', line: '5호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '고덕', line: '5호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '상일동', line: '5호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '여의도', line: '5호선', baseBoarding: 62000, baseAlighting: 61000 },
  { name: '여의나루', line: '5호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '영등포시장', line: '5호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '신길', line: '5호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '까치산', line: '5호선', baseBoarding: 35000, baseAlighting: 34000 },
  
  // 6호선
  { name: '공덕', line: '6호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '효창공원앞', line: '6호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '삼각지', line: '6호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '이태원', line: '6호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '한강진', line: '6호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '약수', line: '6호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '청구', line: '6호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '신당', line: '6호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '동묘앞', line: '6호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '창신', line: '6호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '보문', line: '6호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '안암', line: '6호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '고려대', line: '6호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '월곡', line: '6호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '상월곡', line: '6호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '돌곶이', line: '6호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '석계', line: '6호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '태릉입구', line: '6호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '화랑대', line: '6호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '봉화산', line: '6호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '합정', line: '6호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '상수', line: '6호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '광흥창', line: '6호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '대흥', line: '6호선', baseBoarding: 18000, baseAlighting: 17500 },
  
  // 7호선
  { name: '장암', line: '7호선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '도봉산', line: '7호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '수락산', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '마들', line: '7호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '노원', line: '7호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '중계', line: '7호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '하계', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '공릉', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '태릉입구', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '먹골', line: '7호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '중화', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '상봉', line: '7호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '면목', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '사가정', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '용마산', line: '7호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '중곡', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '군자', line: '7호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '어린이대공원', line: '7호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '건대입구', line: '7호선', baseBoarding: 58000, baseAlighting: 57000 },
  { name: '뚝섬유원지', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '청담', line: '7호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '강남구청', line: '7호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '학동', line: '7호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '논현', line: '7호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '반포', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '고속터미널', line: '7호선', baseBoarding: 65000, baseAlighting: 64000 },
  { name: '내방', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '이수', line: '7호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '남성', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '숭실대입구', line: '7호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '상도', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '장승배기', line: '7호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '신대방삼거리', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '보라매', line: '7호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '신풍', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '대림', line: '7호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '남구로', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '가산디지털단지', line: '7호선', baseBoarding: 68000, baseAlighting: 67000 },
  { name: '철산', line: '7호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '광명사거리', line: '7호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '천왕', line: '7호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '온수', line: '7호선', baseBoarding: 22000, baseAlighting: 21500 },
  
  // 8호선
  { name: '암사', line: '8호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '천호', line: '8호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '강동구청', line: '8호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '몽촌토성', line: '8호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '잠실', line: '8호선', baseBoarding: 72000, baseAlighting: 71000 },
  { name: '석촌', line: '8호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '송파', line: '8호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '가락시장', line: '8호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '문정', line: '8호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '장지', line: '8호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '복정', line: '8호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '산성', line: '8호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '남한산성입구', line: '8호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '단대오거리', line: '8호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '신흥', line: '8호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '수진', line: '8호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '모란', line: '8호선', baseBoarding: 32000, baseAlighting: 31000 },
  
  // 9호선
  { name: '개화', line: '9호선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '김포공항', line: '9호선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '공항시장', line: '9호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '신방화', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '마곡나루', line: '9호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '양천향교', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '가양', line: '9호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '증미', line: '9호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '등촌', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '염창', line: '9호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '신목동', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '선유도', line: '9호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '당산', line: '9호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '국회의사당', line: '9호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '여의도', line: '9호선', baseBoarding: 55000, baseAlighting: 54000 },
  { name: '샛강', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '노량진', line: '9호선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '노들', line: '9호선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '흑석', line: '9호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '동작', line: '9호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '구반포', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '신반포', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '고속터미널', line: '9호선', baseBoarding: 58000, baseAlighting: 57000 },
  { name: '사평', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '신논현', line: '9호선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '언주', line: '9호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '선정릉', line: '9호선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '삼성중앙', line: '9호선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '봉은사', line: '9호선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '종합운동장', line: '9호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '삼전', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '석촌고분', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '석촌', line: '9호선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '송파나루', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '한성백제', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '올림픽공원', line: '9호선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '둔촌오륜', line: '9호선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '중앙보훈병원', line: '9호선', baseBoarding: 15000, baseAlighting: 14500 },

  // 경의중앙선
  { name: '문산', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '파주', line: '경의중앙선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '월롱', line: '경의중앙선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '금촌', line: '경의중앙선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '금릉', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '운정', line: '경의중앙선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '야당', line: '경의중앙선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '탄현', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '일산', line: '경의중앙선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '풍산', line: '경의중앙선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '백마', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '곡산', line: '경의중앙선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '대곡', line: '경의중앙선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '능곡', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '행신', line: '경의중앙선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '강매', line: '경의중앙선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '화전', line: '경의중앙선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '수색', line: '경의중앙선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '디지털미디어시티', line: '경의중앙선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '가좌', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '홍대입구', line: '경의중앙선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '서강대', line: '경의중앙선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '공덕', line: '경의중앙선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '효창공원앞', line: '경의중앙선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '용산', line: '경의중앙선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '이촌', line: '경의중앙선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '서빙고', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '한남', line: '경의중앙선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '옥수', line: '경의중앙선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '응봉', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '왕십리', line: '경의중앙선', baseBoarding: 48000, baseAlighting: 47000 },
  { name: '청량리', line: '경의중앙선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '회기', line: '경의중앙선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '중랑', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '상봉', line: '경의중앙선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '망우', line: '경의중앙선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '양원', line: '경의중앙선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '구리', line: '경의중앙선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '도농', line: '경의중앙선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '양정', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '덕소', line: '경의중앙선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '도심', line: '경의중앙선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '팔당', line: '경의중앙선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '운길산', line: '경의중앙선', baseBoarding: 3000, baseAlighting: 2900 },
  { name: '양수', line: '경의중앙선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '신원', line: '경의중앙선', baseBoarding: 3000, baseAlighting: 2900 },
  { name: '국수', line: '경의중앙선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '아신', line: '경의중앙선', baseBoarding: 3000, baseAlighting: 2900 },
  { name: '오빈', line: '경의중앙선', baseBoarding: 3000, baseAlighting: 2900 },
  { name: '양평', line: '경의중앙선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '원덕', line: '경의중앙선', baseBoarding: 2000, baseAlighting: 1900 },
  { name: '용문', line: '경의중앙선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '지평', line: '경의중앙선', baseBoarding: 2000, baseAlighting: 1900 },

  // 수인분당선
  { name: '청량리', line: '수인분당선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '왕십리', line: '수인분당선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '서울숲', line: '수인분당선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '압구정로데오', line: '수인분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '강남구청', line: '수인분당선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '선정릉', line: '수인분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '선릉', line: '수인분당선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '한티', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '도곡', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '구룡', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '개포동', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '대모산입구', line: '수인분당선', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '수서', line: '수인분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '복정', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '가천대', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '태평', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '모란', line: '수인분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '야탑', line: '수인분당선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '이매', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '서현', line: '수인분당선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '수내', line: '수인분당선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '정자', line: '수인분당선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '미금', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '오리', line: '수인분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '죽전', line: '수인분당선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '보정', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '구성', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '신갈', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '기흥', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '상갈', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '청명', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '영통', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '망포', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '매탄권선', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '수원시청', line: '수인분당선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '매교', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '수원', line: '수인분당선', baseBoarding: 42000, baseAlighting: 41000 },
  { name: '고색', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '오목천', line: '수인분당선', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '어천', line: '수인분당선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '야목', line: '수인분당선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '사리', line: '수인분당선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '한대앞', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '중앙', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '고잔', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '초지', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '안산', line: '수인분당선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '신길온천', line: '수인분당선', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '정왕', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '오이도', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '달월', line: '수인분당선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '월곶', line: '수인분당선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '소래포구', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '인천논현', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '호구포', line: '수인분당선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '남동인더스파크', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '원인재', line: '수인분당선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '연수', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '송도', line: '수인분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '인하대', line: '수인분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '숭의', line: '수인분당선', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '신포', line: '수인분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '인천', line: '수인분당선', baseBoarding: 25000, baseAlighting: 24500 },

  // 신분당선
  { name: '신사', line: '신분당선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '논현', line: '신분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '신논현', line: '신분당선', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '강남', line: '신분당선', baseBoarding: 52000, baseAlighting: 51000 },
  { name: '양재', line: '신분당선', baseBoarding: 32000, baseAlighting: 31000 },
  { name: '양재시민의숲', line: '신분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '청계산입구', line: '신분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '판교', line: '신분당선', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '정자', line: '신분당선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '미금', line: '신분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '동천', line: '신분당선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '수지구청', line: '신분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '성복', line: '신분당선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '상현', line: '신분당선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '광교중앙', line: '신분당선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '광교', line: '신분당선', baseBoarding: 25000, baseAlighting: 24500 },

  // 공항철도
  { name: '서울역', line: '공항철도', baseBoarding: 45000, baseAlighting: 44000 },
  { name: '공덕', line: '공항철도', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '홍대입구', line: '공항철도', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '디지털미디어시티', line: '공항철도', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '마곡나루', line: '공항철도', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '김포공항', line: '공항철도', baseBoarding: 38000, baseAlighting: 37000 },
  { name: '계양', line: '공항철도', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '검암', line: '공항철도', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '청라국제도시', line: '공항철도', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '영종', line: '공항철도', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '운서', line: '공항철도', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '공항화물청사', line: '공항철도', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '인천공항1터미널', line: '공항철도', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '인천공항2터미널', line: '공항철도', baseBoarding: 28000, baseAlighting: 27000 },

  // 경춘선
  { name: '청량리', line: '경춘선', baseBoarding: 25000, baseAlighting: 24500 },
  { name: '회기', line: '경춘선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '중랑', line: '경춘선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '상봉', line: '경춘선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '망우', line: '경춘선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '신내', line: '경춘선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '갈매', line: '경춘선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '별내', line: '경춘선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '퇴계원', line: '경춘선', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '사릉', line: '경춘선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '금곡', line: '경춘선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '평내호평', line: '경춘선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '천마산', line: '경춘선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '마석', line: '경춘선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '대성리', line: '경춘선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '청평', line: '경춘선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '상천', line: '경춘선', baseBoarding: 3000, baseAlighting: 2900 },
  { name: '가평', line: '경춘선', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '굴봉산', line: '경춘선', baseBoarding: 3000, baseAlighting: 2900 },
  { name: '백양리', line: '경춘선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '강촌', line: '경춘선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '김유정', line: '경춘선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '남춘천', line: '경춘선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '춘천', line: '경춘선', baseBoarding: 18000, baseAlighting: 17500 },

  // 경강선
  { name: '판교', line: '경강선', baseBoarding: 35000, baseAlighting: 34000 },
  { name: '이매', line: '경강선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '삼동', line: '경강선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '경기광주', line: '경강선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '초월', line: '경강선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '곤지암', line: '경강선', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '신둔도예촌', line: '경강선', baseBoarding: 4000, baseAlighting: 3900 },
  { name: '이천', line: '경강선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '부발', line: '경강선', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '세종대왕릉', line: '경강선', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '여주', line: '경강선', baseBoarding: 12000, baseAlighting: 11500 },

  // 김포골드라인
  { name: '김포공항', line: '김포골드라인', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '고촌', line: '김포골드라인', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '풍무', line: '김포골드라인', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '사우', line: '김포골드라인', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '걸포북변', line: '김포골드라인', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '김포시청', line: '김포골드라인', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '장기', line: '김포골드라인', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '운양', line: '김포골드라인', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '구래', line: '김포골드라인', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '마산', line: '김포골드라인', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '양촌', line: '김포골드라인', baseBoarding: 10000, baseAlighting: 9800 },

  // 용인에버라인
  { name: '기흥', line: '용인에버라인', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '강남대', line: '용인에버라인', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '지석', line: '용인에버라인', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '어정', line: '용인에버라인', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '동백', line: '용인에버라인', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '초당', line: '용인에버라인', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '삼가', line: '용인에버라인', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '시청·용인대', line: '용인에버라인', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '명지대', line: '용인에버라인', baseBoarding: 10000, baseAlighting: 9800 },
  { name: '김량장', line: '용인에버라인', baseBoarding: 8000, baseAlighting: 7800 },
  { name: '운동장·송담대', line: '용인에버라인', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '고진', line: '용인에버라인', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '보평', line: '용인에버라인', baseBoarding: 6000, baseAlighting: 5800 },
  { name: '둔전', line: '용인에버라인', baseBoarding: 5000, baseAlighting: 4800 },
  { name: '전대·에버랜드', line: '용인에버라인', baseBoarding: 15000, baseAlighting: 14500 },

  // 신림선
  { name: '샛강', line: '신림선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '대방', line: '신림선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '보라매', line: '신림선', baseBoarding: 22000, baseAlighting: 21500 },
  { name: '보라매공원', line: '신림선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '보라매병원', line: '신림선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '당곡', line: '신림선', baseBoarding: 12000, baseAlighting: 11500 },
  { name: '신림', line: '신림선', baseBoarding: 28000, baseAlighting: 27000 },
  { name: '서원', line: '신림선', baseBoarding: 15000, baseAlighting: 14500 },
  { name: '서울대벤처타운', line: '신림선', baseBoarding: 18000, baseAlighting: 17500 },
  { name: '관악산', line: '신림선', baseBoarding: 10000, baseAlighting: 9800 },
];

/**
 * 랜덤 변동폭 적용
 * @param base - 기본값
 * @param variance - 변동 비율 (0.1 = ±10%)
 * @returns 변동이 적용된 값
 */
function applyVariance(base: number, variance: number = 0.15): number {
  const factor = 1 + (Math.random() - 0.5) * 2 * variance;
  return Math.round(base * factor);
}

/**
 * 주말/공휴일 감소율 적용
 * 일반적으로 주말에는 출퇴근 수요 감소로 이용객이 줄어들지만,
 * 일부 관광/상업 지역은 오히려 증가하는 패턴을 반영
 */
function getWeekendMultiplier(stationName: string): number {
  // 관광/쇼핑 지역은 주말에 오히려 증가
  const touristStations = [
    '홍대입구', '명동', '이태원', '잠실', '건대입구', '강남', '압구정', '신사', '경복궁', '안국', '종로3가', '동대문', '고속터미널',
    '인천공항1터미널', '인천공항2터미널', '김포공항', // 공항철도
    '가평', '강촌', '춘천', '남춘천', '청평', // 경춘선 관광지
    '전대·에버랜드', // 용인에버라인
    '서울숲', '압구정로데오', // 수인분당선
    '여주', '세종대왕릉', // 경강선 관광지
  ];
  if (touristStations.includes(stationName)) {
    return 0.9 + Math.random() * 0.3; // 0.9 ~ 1.2배
  }
  
  // 업무 지역은 주말에 크게 감소
  const businessStations = [
    '여의도', '광화문', '을지로입구', '선릉', '역삼', '삼성', '구로디지털단지', '가산디지털단지', '판교',
    '정자', '미금', '서현', '야탑', // 분당 업무지구
    '디지털미디어시티', // 경의중앙선
    '양재', '양재시민의숲', '강남구청', // 신분당선/수인분당선
    '남동인더스파크', // 수인분당선 산업단지
    '수원시청', '송도', // 수인분당선
  ];
  if (businessStations.includes(stationName)) {
    return 0.3 + Math.random() * 0.2; // 0.3 ~ 0.5배
  }
  
  // 일반 주거 지역은 중간 정도 감소
  return 0.6 + Math.random() * 0.2; // 0.6 ~ 0.8배
}

/**
 * 최근 30일간의 샘플 데이터 생성
 * @returns 지하철 이용객 데이터 배열
 */
export function generateSampleData(): SubwayUsageData[] {
  const dates = getRecentDates(30);
  const data: SubwayUsageData[] = [];

  for (const station of SEOUL_METRO_STATIONS) {
    for (const date of dates) {
      const weekday = isWeekday(date);
      const multiplier = weekday ? 1 : getWeekendMultiplier(station.name);
      
      const boarding = applyVariance(Math.round(station.baseBoarding * multiplier));
      const alighting = applyVariance(Math.round(station.baseAlighting * multiplier));

      data.push({
        stationName: station.name,
        lineName: station.line,
        date: date,
        boardingCount: boarding,
        alightingCount: alighting,
      });
    }
  }

  return data;
}

/**
 * 역 목록 조회 (중복 제거)
 * @returns 역 정보 배열
 */
export function getStationList(): { name: string; line: string }[] {
  return SEOUL_METRO_STATIONS.map(s => ({ name: s.name, line: s.line }));
}

/**
 * 노선 목록 조회
 * @returns 노선명 배열
 */
export function getLineList(): string[] {
  const lines = new Set(SEOUL_METRO_STATIONS.map(s => s.line));
  return Array.from(lines).sort();
}
