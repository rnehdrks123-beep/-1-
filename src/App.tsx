/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiagnosticForm } from './components/DiagnosticForm';
import { ReportCard } from './components/ReportCard';
import { StoreInfo, DiagnosisResult } from './types';
import { BarChart3, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<DiagnosisResult | null>(null);
  const [lastStoreInfo, setLastStoreInfo] = React.useState<StoreInfo | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleDiagnose = async (data: StoreInfo) => {
    setIsLoading(true);
    setError(null);
    setLastStoreInfo(data);
    
    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '진단 중 오류가 발생했습니다.');
      }

      const diagnosis = await response.json();
      setResult(diagnosis);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen premium-gradient selection:bg-emerald-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[180px] rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-teal-500/10 blur-[180px] rounded-full animate-pulse opacity-50" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-8"
          >
            <BarChart3 className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            플레이스 진단 리포트
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            네이버 알고리즘 최적화를 위한 <span className="text-emerald-400 font-bold">인공지능 정밀 진단 시스템</span>
          </motion.p>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DiagnosticForm onSubmit={handleDiagnose} isLoading={isLoading} />
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 font-bold"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-start">
                  <button 
                    onClick={resetForm}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold transition-all px-4 py-2 rounded-lg hover:bg-white/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    다른 매장 진단하기
                  </button>
                </div>
                
                {lastStoreInfo && <ReportCard result={result} storeInfo={lastStoreInfo} />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-400 font-medium">
          <p>© 2026 DyMonth Diagnostic tool. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

