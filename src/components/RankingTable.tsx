'use client';

import { useState, useMemo } from 'react';
import { RankingItem } from '@/lib/types';

interface RankingTableProps {
  data: RankingItem[];
  title: string;
  metricLabel: string;
}

type SortField = 'rank' | 'stationName' | 'lineName' | 'count';
type SortDirection = 'asc' | 'desc';

export default function RankingTable({ data, title, metricLabel }: RankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'stationName':
          comparison = a.stationName.localeCompare(b.stationName, 'ko');
          break;
        case 'lineName':
          comparison = a.lineName.localeCompare(b.lineName, 'ko');
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
      </div>
      
      {/* 모바일 카드 뷰 (sm 이하) */}
      <div className="block sm:hidden">
        {/* 정렬 옵션 */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">정렬:</span>
            <button
              onClick={() => handleSort('rank')}
              className={`px-2 py-1 rounded ${sortField === 'rank' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-slate-700'}`}
            >
              순위{sortField === 'rank' && getSortIndicator('rank')}
            </button>
            <button
              onClick={() => handleSort('stationName')}
              className={`px-2 py-1 rounded ${sortField === 'stationName' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-slate-700'}`}
            >
              역명{sortField === 'stationName' && getSortIndicator('stationName')}
            </button>
            <button
              onClick={() => handleSort('count')}
              className={`px-2 py-1 rounded ${sortField === 'count' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-slate-700'}`}
            >
              인원{sortField === 'count' && getSortIndicator('count')}
            </button>
          </div>
        </div>
        
        {/* 카드 목록 */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedData.map((item, index) => (
            <div 
              key={`${item.stationName}-${item.lineName}-${index}`}
              className="px-3 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {/* 순위 */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${item.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
              `}>
                {item.rank}
              </div>
              
              {/* 역 정보 */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.stationName}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getLineColor(item.lineName)}`}>
                  {item.lineName}
                </span>
              </div>
              
              {/* 인원수 */}
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-sm">{formatNumber(item.count)}</div>
                <div className="text-xs text-slate-500">명</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 데스크톱 테이블 뷰 (sm 이상) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th 
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                onClick={() => handleSort('rank')}
                style={{ width: '80px' }}
              >
                순위{getSortIndicator('rank')}
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                onClick={() => handleSort('stationName')}
              >
                역 이름{getSortIndicator('stationName')}
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                onClick={() => handleSort('lineName')}
                style={{ width: '120px' }}
              >
                노선{getSortIndicator('lineName')}
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                onClick={() => handleSort('count')}
                style={{ width: '160px' }}
              >
                {metricLabel}{getSortIndicator('count')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedData.map((item, index) => (
              <tr 
                key={`${item.stationName}-${item.lineName}-${index}`}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3 text-center">
                  <span className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                    ${item.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                  `}>
                    {item.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{item.stationName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getLineColor(item.lineName)}`}>
                    {item.lineName}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium">
                  {formatNumber(item.count)}명
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 푸터 */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-500 border-t border-slate-200 dark:border-slate-700">
        총 {data.length}개 역 | 헤더를 클릭하여 정렬
      </div>
    </div>
  );
}

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
