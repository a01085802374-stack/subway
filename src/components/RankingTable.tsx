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
    <div className="ghibli-card overflow-hidden">
      {/* 헤더 - 지브리 스타일 */}
      <div className="bg-gradient-to-r from-ghibli-forest via-ghibli-leaf to-ghibli-moss text-white px-4 py-4 relative overflow-hidden">
        {/* 장식 구름 */}
        <div className="absolute top-1 right-10 w-12 h-4 bg-white/20 rounded-full blur-sm" />
        <div className="absolute top-2 right-16 w-8 h-3 bg-white/20 rounded-full blur-sm" />
        <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 relative z-10">
          <span>🏆</span>
          {title}
        </h3>
      </div>
      
      {/* 모바일 카드 뷰 (sm 이하) */}
      <div className="block sm:hidden bg-white/60">
        {/* 정렬 옵션 */}
        <div className="px-3 py-2 bg-ghibli-beige/70 border-b border-ghibli-sand">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-ghibli-earth">정렬:</span>
            <button
              onClick={() => handleSort('rank')}
              className={`px-2 py-1 rounded-lg transition-all ${sortField === 'rank' ? 'bg-ghibli-leaf/30 text-ghibli-forest font-medium' : 'bg-white/80 text-ghibli-brown'}`}
            >
              순위{sortField === 'rank' && getSortIndicator('rank')}
            </button>
            <button
              onClick={() => handleSort('stationName')}
              className={`px-2 py-1 rounded-lg transition-all ${sortField === 'stationName' ? 'bg-ghibli-leaf/30 text-ghibli-forest font-medium' : 'bg-white/80 text-ghibli-brown'}`}
            >
              역명{sortField === 'stationName' && getSortIndicator('stationName')}
            </button>
            <button
              onClick={() => handleSort('count')}
              className={`px-2 py-1 rounded-lg transition-all ${sortField === 'count' ? 'bg-ghibli-leaf/30 text-ghibli-forest font-medium' : 'bg-white/80 text-ghibli-brown'}`}
            >
              인원{sortField === 'count' && getSortIndicator('count')}
            </button>
          </div>
        </div>
        
        {/* 카드 목록 */}
        <div className="divide-y divide-ghibli-sand/50">
          {sortedData.map((item, index) => (
            <div 
              key={`${item.stationName}-${item.lineName}-${index}`}
              className="px-3 py-3 flex items-center gap-3 hover:bg-ghibli-mint/20 transition-colors"
            >
              {/* 순위 */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${item.rank === 1 ? 'bg-yellow-300 text-yellow-900' : 
                  item.rank === 2 ? 'bg-gray-300 text-gray-800' : 
                  item.rank === 3 ? 'bg-amber-400 text-amber-900' : 
                  'bg-ghibli-beige text-ghibli-earth'}
              `}>
                {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
              </div>
              
              {/* 역 정보 */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate text-ghibli-charcoal">{item.stationName}</div>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-medium ${getLineColor(item.lineName)}`}>
                  {item.lineName}
                </span>
              </div>
              
              {/* 인원수 */}
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-sm text-ghibli-charcoal">{formatNumber(item.count)}</div>
                <div className="text-xs text-ghibli-earth">명</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 데스크톱 테이블 뷰 (sm 이상) */}
      <div className="hidden sm:block overflow-x-auto bg-white/60">
        <table className="w-full">
          <thead>
            <tr className="bg-ghibli-beige/70 border-b-2 border-ghibli-sand">
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-ghibli-charcoal cursor-pointer hover:bg-ghibli-moss/20 transition-colors select-none"
                onClick={() => handleSort('rank')}
                style={{ width: '80px' }}
              >
                순위{getSortIndicator('rank')}
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-ghibli-charcoal cursor-pointer hover:bg-ghibli-moss/20 transition-colors select-none"
                onClick={() => handleSort('stationName')}
              >
                역 이름{getSortIndicator('stationName')}
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-ghibli-charcoal cursor-pointer hover:bg-ghibli-moss/20 transition-colors select-none"
                onClick={() => handleSort('lineName')}
                style={{ width: '120px' }}
              >
                노선{getSortIndicator('lineName')}
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-ghibli-charcoal cursor-pointer hover:bg-ghibli-moss/20 transition-colors select-none"
                onClick={() => handleSort('count')}
                style={{ width: '160px' }}
              >
                {metricLabel}{getSortIndicator('count')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ghibli-sand/50">
            {sortedData.map((item, index) => (
              <tr 
                key={`${item.stationName}-${item.lineName}-${index}`}
                className="hover:bg-ghibli-mint/20 transition-colors"
              >
                <td className="px-4 py-3 text-center">
                  <span className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                    ${item.rank === 1 ? 'bg-yellow-300 text-yellow-900' : 
                      item.rank === 2 ? 'bg-gray-300 text-gray-800' : 
                      item.rank === 3 ? 'bg-amber-400 text-amber-900' : 
                      'bg-ghibli-beige text-ghibli-earth'}
                  `}>
                    {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-ghibli-charcoal">{item.stationName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getLineColor(item.lineName)}`}>
                    {item.lineName}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium text-ghibli-charcoal">
                  {formatNumber(item.count)}명
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 푸터 */}
      <div className="px-4 py-3 bg-ghibli-beige/50 text-xs sm:text-sm text-ghibli-earth border-t border-ghibli-sand flex items-center gap-2">
        <span>🌿</span>
        <span>총 {data.length}개 역</span>
        <span className="mx-2">|</span>
        <span>헤더를 클릭하여 정렬</span>
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
