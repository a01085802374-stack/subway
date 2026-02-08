'use client';

import { useState, useMemo } from 'react';
import Modal from './Modal';

interface StationInfo {
  name: string;
  line: string;
  avgBoarding?: number;
  avgAlighting?: number;
  dataCount?: number;  // 실제 데이터 일수
}

type SortField = 'name' | 'avgBoarding' | 'avgAlighting';
type SortDirection = 'asc' | 'desc';

interface DataSummaryProps {
  summary: {
    totalRecords: number;
    uniqueStations: number;
    uniqueLines: number;
    dateRange: { start: string; end: string };
    weekdayCount: number;
    weekendHolidayCount: number;
    lineList?: string[];
    stationList?: StationInfo[];  // 노선별로 분리된 역 목록
    year?: number;
    month?: number;
  } | null;
  loading: boolean;
}

// 노선별 색상
function getLineColor(lineName: string): string {
  const colors: Record<string, string> = {
    '1호선': 'bg-blue-900 text-white',
    '2호선': 'bg-green-500 text-white',
    '3호선': 'bg-orange-500 text-white',
    '4호선': 'bg-sky-400 text-white',
    '5호선': 'bg-purple-500 text-white',
    '6호선': 'bg-amber-600 text-white',
    '7호선': 'bg-[#6B8E23] text-white',
    '8호선': 'bg-pink-500 text-white',
    '9호선': 'bg-yellow-400 text-black',
    '경의중앙선': 'bg-teal-500 text-white',
    '수인분당선': 'bg-yellow-500 text-black',
    '신분당선': 'bg-red-600 text-white',
    '공항철도': 'bg-sky-600 text-white',
    '경춘선': 'bg-cyan-600 text-white',
    '경강선': 'bg-blue-500 text-white',
    '김포골드라인': 'bg-amber-400 text-black',
    '용인에버라인': 'bg-emerald-500 text-white',
    '신림선': 'bg-indigo-500 text-white',
  };
  return colors[lineName] || 'bg-slate-500 text-white';
}

export default function DataSummary({ summary, loading }: DataSummaryProps) {
  const [showLineModal, setShowLineModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // 정렬된 역 목록
  const sortedStationList = useMemo(() => {
    if (!summary?.stationList) return [];
    
    return [...summary.stationList].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ko');
          if (comparison === 0) {
            // 같은 역이면 노선 번호순
            const numA = parseInt(a.line.replace(/[^0-9]/g, '')) || 999;
            const numB = parseInt(b.line.replace(/[^0-9]/g, '')) || 999;
            comparison = numA - numB;
          }
          break;
        case 'avgBoarding':
          comparison = (a.avgBoarding || 0) - (b.avgBoarding || 0);
          break;
        case 'avgAlighting':
          comparison = (a.avgAlighting || 0) - (b.avgAlighting || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [summary?.stationList, sortField, sortDirection]);

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 정렬 인디케이터
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="ghibli-card p-5 mb-6 animate-pulse">
        <div className="h-4 bg-ghibli-sand rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-ghibli-beige rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="ghibli-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-ghibli-charcoal flex items-center gap-2">
          <span className="text-xl">📊</span>
          데이터 요약
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 분석 기간 */}
          <div className="bg-ghibli-sky/20 rounded-xl p-3 border border-ghibli-cloud">
            <div className="text-xs sm:text-sm text-ghibli-water flex items-center gap-1">
              <span>📅</span> 분석 기간
            </div>
            <div className="text-lg sm:text-xl font-bold mt-1 text-ghibli-charcoal">
              {summary.year && summary.month ? (
                <>{summary.year}년 {summary.month}월</>
              ) : (
                '최근 30일'
              )}
            </div>
            <div className="text-xs text-ghibli-earth mt-1 truncate" title={formatDate(summary.dateRange.start)}>
              {formatDate(summary.dateRange.start)}
            </div>
            <div className="text-xs text-ghibli-earth truncate" title={formatDate(summary.dateRange.end)}>
              ~ {formatDate(summary.dateRange.end)}
            </div>
          </div>
          
          {/* 총 역 수 - 클릭 가능 */}
          <button
            onClick={() => setShowStationModal(true)}
            className="bg-ghibli-mint/30 rounded-xl p-3 text-left hover:ring-2 hover:ring-ghibli-leaf transition-all cursor-pointer group border border-ghibli-moss/30"
          >
            <div className="text-xs sm:text-sm text-ghibli-forest flex items-center gap-1">
              <span>🚉</span> 총 역 수
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-ghibli-charcoal">{summary.uniqueStations}</div>
            <div className="text-xs text-ghibli-earth">개 역 (클릭)</div>
          </button>
          
          {/* 노선 수 - 클릭 가능 */}
          <button
            onClick={() => setShowLineModal(true)}
            className="bg-ghibli-sunset/20 rounded-xl p-3 text-left hover:ring-2 hover:ring-ghibli-terracotta transition-all cursor-pointer group border border-ghibli-coral/30"
          >
            <div className="text-xs sm:text-sm text-ghibli-terracotta flex items-center gap-1">
              <span>🚇</span> 노선 수
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-ghibli-charcoal">{summary.uniqueLines}</div>
            <div className="text-xs text-ghibli-earth">개 노선 (클릭)</div>
          </button>
          
          {/* 평일 */}
          <div className="bg-ghibli-leaf/20 rounded-xl p-3 border border-ghibli-moss/30">
            <div className="text-xs sm:text-sm text-ghibli-forest flex items-center gap-1">
              <span>🌿</span> 평일
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-ghibli-charcoal">{summary.weekdayCount}</div>
            <div className="text-xs text-ghibli-earth">일</div>
          </div>
          
          {/* 주말·공휴일 */}
          <div className="bg-ghibli-coral/20 rounded-xl p-3 border border-ghibli-terracotta/30">
            <div className="text-xs sm:text-sm text-ghibli-terracotta flex items-center gap-1">
              <span>🌅</span> 주말·공휴일
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-ghibli-charcoal">{summary.weekendHolidayCount}</div>
            <div className="text-xs text-ghibli-earth">일</div>
          </div>
          
          {/* 총 레코드 */}
          <div className="bg-ghibli-beige rounded-xl p-3 border border-ghibli-sand">
            <div className="text-xs sm:text-sm text-ghibli-earth flex items-center gap-1">
              <span>📋</span> 총 레코드
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-ghibli-charcoal">{summary.totalRecords.toLocaleString()}</div>
            <div className="text-xs text-ghibli-earth">건</div>
          </div>
        </div>
      </div>

      {/* 노선 목록 모달 */}
      <Modal
        isOpen={showLineModal}
        onClose={() => setShowLineModal(false)}
        title={`전체 노선 목록 (${summary.uniqueLines}개)`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {summary.lineList?.map((line) => (
            <div
              key={line}
              className={`${getLineColor(line)} rounded-lg px-4 py-3 text-center font-medium shadow-sm`}
            >
              {line}
            </div>
          ))}
        </div>
      </Modal>

      {/* 역 목록 모달 */}
      <Modal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        title={`전체 역 목록 (${summary.uniqueStations}개 역, ${summary.stationList?.length || 0}개 노선별)`}
      >
        <div className="space-y-1">
          {/* 검색 힌트 */}
          <p className="text-sm text-slate-500 mb-4">
            환승역은 노선별로 분리되어 표시됩니다. 헤더를 클릭하여 정렬할 수 있습니다.
          </p>
          
          {/* 역 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400 w-10">#</th>
                  <th 
                    className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    역명{getSortIndicator('name')}
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">노선</th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none whitespace-nowrap"
                    onClick={() => handleSort('avgBoarding')}
                  >
                    <span className="text-green-600 dark:text-green-400">평균 승차{getSortIndicator('avgBoarding')}</span>
                  </th>
                  <th 
                    className="text-right py-2 px-2 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none whitespace-nowrap"
                    onClick={() => handleSort('avgAlighting')}
                  >
                    <span className="text-blue-600 dark:text-blue-400">평균 하차{getSortIndicator('avgAlighting')}</span>
                  </th>
                  <th className="text-center py-2 px-2 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    데이터
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStationList.map((station, index) => (
                  <tr 
                    key={`${station.name}-${station.line}`}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-2 px-2 text-slate-400 text-xs">{index + 1}</td>
                    <td className="py-2 px-2 font-medium whitespace-nowrap">{station.name}</td>
                    <td className="py-2 px-2">
                      <span className={`${getLineColor(station.line)} text-xs px-1.5 py-0.5 rounded`}>
                        {station.line}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-green-600 dark:text-green-400 whitespace-nowrap">
                      {station.avgBoarding?.toLocaleString() || '-'}명
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {station.avgAlighting?.toLocaleString() || '-'}명
                    </td>
                    <td className="py-2 px-2 text-center text-slate-500 text-xs whitespace-nowrap">
                      {station.dataCount || '-'}일
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 범례 */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              * 평균 승차/하차: 실제 데이터가 있는 일수 기준 일평균 (데이터 없는 날짜 제외)
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
