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

  const getSortClass = (field: SortField) => {
    if (sortField !== field) return 'sortable';
    return `sortable ${sortDirection}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th 
                className={getSortClass('rank')}
                onClick={() => handleSort('rank')}
                style={{ width: '60px' }}
              >
                순위
              </th>
              <th 
                className={getSortClass('stationName')}
                onClick={() => handleSort('stationName')}
              >
                역 이름
              </th>
              <th 
                className={getSortClass('lineName')}
                onClick={() => handleSort('lineName')}
                style={{ width: '100px' }}
              >
                노선
              </th>
              <th 
                className={getSortClass('count')}
                onClick={() => handleSort('count')}
                style={{ width: '140px', textAlign: 'right' }}
              >
                {metricLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={`${item.stationName}-${item.lineName}-${index}`}>
                <td className="text-center font-medium">
                  <span className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full text-sm
                    ${item.rank <= 3 ? 'bg-yellow-100 text-yellow-800 font-bold' : 'bg-slate-100 text-slate-600'}
                  `}>
                    {item.rank}
                  </span>
                </td>
                <td className="font-medium">{item.stationName}</td>
                <td>
                  <span className={`
                    inline-block px-2 py-1 rounded text-xs font-medium
                    ${getLineColor(item.lineName)}
                  `}>
                    {item.lineName}
                  </span>
                </td>
                <td className="text-right font-mono">
                  {formatNumber(item.count)}명
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500">
        총 {data.length}개 역 | 클릭하여 정렬
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
    '7호선': 'bg-olive-600 text-white bg-[#6B8E23]',
    '8호선': 'bg-pink-500 text-white',
    '9호선': 'bg-yellow-400 text-black',
  };
  return colors[lineName] || 'bg-slate-500 text-white';
}
