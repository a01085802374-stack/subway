'use client';

import { useState } from 'react';
import Modal from './Modal';

interface StationInfo {
  name: string;
  lines: string[];
  avgBoarding?: number;
  avgAlighting?: number;
}

interface DataSummaryProps {
  summary: {
    totalRecords: number;
    uniqueStations: number;
    uniqueLines: number;
    dateRange: { start: string; end: string };
    weekdayCount: number;
    weekendHolidayCount: number;
    lineList?: string[];
    stationList?: StationInfo[];
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 mb-6 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
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
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">데이터 요약</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 분석 기간 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">분석 기간</div>
            <div className="text-lg sm:text-xl font-bold mt-1">30일</div>
            <div className="text-xs text-slate-500 mt-1 truncate" title={formatDate(summary.dateRange.start)}>
              {formatDate(summary.dateRange.start)}
            </div>
            <div className="text-xs text-slate-500 truncate" title={formatDate(summary.dateRange.end)}>
              ~ {formatDate(summary.dateRange.end)}
            </div>
          </div>
          
          {/* 총 역 수 - 클릭 가능 */}
          <button
            onClick={() => setShowStationModal(true)}
            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-left hover:ring-2 hover:ring-green-400 transition-all cursor-pointer group"
          >
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              총 역 수
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{summary.uniqueStations}</div>
            <div className="text-xs text-slate-500">개 역 (클릭)</div>
          </button>
          
          {/* 노선 수 - 클릭 가능 */}
          <button
            onClick={() => setShowLineModal(true)}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-left hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer group"
          >
            <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
              노선 수
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{summary.uniqueLines}</div>
            <div className="text-xs text-slate-500">개 노선 (클릭)</div>
          </button>
          
          {/* 평일 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">평일</div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{summary.weekdayCount}</div>
            <div className="text-xs text-slate-500">일</div>
          </div>
          
          {/* 주말·공휴일 */}
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-pink-600 dark:text-pink-400">주말·공휴일</div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{summary.weekendHolidayCount}</div>
            <div className="text-xs text-slate-500">일</div>
          </div>
          
          {/* 총 레코드 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">총 레코드</div>
            <div className="text-xl sm:text-2xl font-bold mt-1">{summary.totalRecords.toLocaleString()}</div>
            <div className="text-xs text-slate-500">건</div>
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
        title={`전체 역 목록 (${summary.uniqueStations}개)`}
      >
        <div className="space-y-1">
          {/* 검색 힌트 */}
          <p className="text-sm text-slate-500 mb-4">
            가나다순으로 정렬되어 있습니다. 환승역은 노선별 인원이 합산되어 표시됩니다.
          </p>
          
          {/* 역 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400 w-10">#</th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">역명</th>
                  <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">노선</th>
                  <th className="text-right py-2 px-2 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <span className="text-green-600 dark:text-green-400">평균 승차</span>
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <span className="text-blue-600 dark:text-blue-400">평균 하차</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.stationList?.map((station, index) => (
                  <tr 
                    key={station.name}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-2 px-2 text-slate-400 text-xs">{index + 1}</td>
                    <td className="py-2 px-2 font-medium whitespace-nowrap">{station.name}</td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {station.lines.map((line) => (
                          <span
                            key={line}
                            className={`${getLineColor(line)} text-xs px-1.5 py-0.5 rounded`}
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-green-600 dark:text-green-400 whitespace-nowrap">
                      {station.avgBoarding?.toLocaleString() || '-'}명
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {station.avgAlighting?.toLocaleString() || '-'}명
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 범례 */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              * 평균 승차/하차: 최근 30일 전체 기간 일평균 (평일+주말+공휴일)
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
