'use client';

import { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 - 지브리 스타일 */}
      <div 
        className="absolute inset-0 bg-ghibli-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 - 지브리 스타일 */}
      <div className="relative bg-ghibli-cream rounded-2xl shadow-ghibli-lg w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border-2 border-ghibli-sand">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-ghibli-sand bg-gradient-to-r from-ghibli-beige to-ghibli-cream rounded-t-2xl">
          <h3 className="text-lg sm:text-xl font-semibold text-ghibli-charcoal flex items-center gap-2">
            <span>📋</span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ghibli-sand/50 rounded-xl transition-colors text-ghibli-earth"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 본문 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white/80">
          {children}
        </div>
        
        {/* 푸터 */}
        <div className="px-4 sm:px-6 py-3 border-t-2 border-ghibli-sand bg-ghibli-beige/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full sm:w-auto ghibli-btn-primary"
          >
            🌿 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
