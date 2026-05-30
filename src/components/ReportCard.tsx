/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiagnosisResult, StoreInfo } from '../types';
import { Camera, AlertCircle, TrendingUp, Users, Zap, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ReportCardProps {
  result: DiagnosisResult;
  storeInfo: StoreInfo;
}

export const ReportCard: React.FC<ReportCardProps> = ({ result, storeInfo }) => {
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);

  const downloadImage = async () => {
    if (!reportRef.current || isCapturing) return;
    
    setIsCapturing(true);
    try {
      // Ensure fonts are loaded before capture
      await document.fonts.ready;
      
      // Wait a bit for any layout shifts or animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // html-to-image options
      const options = {
        quality: 1.0,
        pixelRatio: 2, // Slightly lower but still high quality for better stability
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          transition: 'none',
          animation: 'none',
          margin: '0',
          padding: '0',
          boxShadow: 'none',
        }
      };

      const dataUrl = await toPng(reportRef.current, options);
      
      const fileName = `${storeInfo.placeName}_진단리포트.png`;

      // Try File System Access API
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const fetchRes = await fetch(dataUrl);
          const blob = await fetchRes.blob();
          
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setIsCapturing(false);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
             setIsCapturing(false);
             return;
          }
          console.warn("File System Access API failed, falling back to standard download", err);
        }
      }

      // Standard download fallback
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUrl;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 200);

    } catch (err) {
      console.error("Capture Failed:", err);
      alert("이미지 저장 중 오류가 발생했습니다. 브라우저 호환성 문제일 수 있으니, 최신 브라우저 크롬을 권장합니다.");
    } finally {
      setIsCapturing(false);
    }
  };

  const SectionTitle = ({ children, icon: Icon, colorClass = "text-slate-900" }: { children: React.ReactNode, icon: any, colorClass?: string }) => (
    <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-2.5">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <h4 className={`text-base font-black uppercase tracking-wider ${colorClass}`}>{children}</h4>
    </div>
  );

  const InfoRow = ({ label, value, highlight = false }: { label: string, value: string | React.ReactNode, highlight?: boolean }) => (
    <div className="flex items-start mb-4 last:mb-0">
      <div className="w-32 flex-shrink-0 text-sm font-black text-slate-400 uppercase tracking-tighter">{label} :</div>
      <div className={cn(
        "text-sm font-bold leading-relaxed break-keep px-3 py-1 rounded-md transition-all",
        highlight ? "text-emerald-600 bg-emerald-50 font-black text-lg shadow-sm" : "text-slate-700"
      )}>
        {value}
      </div>
    </div>
  );

  const ToolBadge = ({ isActive, label }: { isActive: boolean, label: string }) => (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black mr-2 mb-2 transition-all shadow-sm",
      isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500 opacity-60"
    )}>
      {label}{isActive ? ' 등록' : ' 미등록'}
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-12 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        ref={reportRef} 
        data-report-container
        className="w-full max-w-[720px] bg-white p-2 rounded-[2rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        <div className="bg-slate-50/30 border border-slate-100 rounded-[1.8rem] p-12 relative overflow-hidden">
          {/* Subtle pattern decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 -mr-32 -mt-32 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 -ml-32 -mb-32 rounded-full blur-[80px]" />
          
          <header className="text-center mb-14 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full text-[10px] font-black text-emerald-400 mb-6 uppercase tracking-[0.3em]">
              Naver Place Diagnostic Report
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter leading-none">📊 플레이스 정밀 진단 리포트</h2>
            <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full mb-4" />
            <p className="text-slate-500 font-bold tracking-tight text-lg">대상 매장: <span className="text-slate-900 font-extrabold border-b-2 border-emerald-500/30 pb-0.5">{storeInfo.placeName}</span></p>
          </header>

          <div className="space-y-10">
            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-hover hover:shadow-md duration-300">
              <SectionTitle icon={Zap} colorClass="text-emerald-500">1. 현재 점수 및 예상 순위</SectionTitle>
              <div className="space-y-2">
                <InfoRow label="등록 키워드" value={storeInfo.keywords || "미등록"} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">플레이스 점수</div>
                    <div className="text-3xl font-black text-red-500">{result.seoScore}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">예상 노출 순위</div>
                    <div className="text-3xl font-black text-red-500">{result.seoRank}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="px-4">
              <SectionTitle icon={AlertCircle}>📌 2. 네이버 도구 누락 및 알고리즘 진단</SectionTitle>
              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">현재 세팅 현황</div>
                  <div className="flex flex-wrap">
                    <ToolBadge isActive={storeInfo.useBooking} label="예약" />
                    <ToolBadge isActive={storeInfo.useTalkTalk} label="톡톡" />
                    <ToolBadge isActive={storeInfo.useCoupon} label="쿠폰" />
                    <ToolBadge isActive={storeInfo.useSafeCall} label="안심번호" />
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500 italic font-medium text-slate-700 leading-relaxed">
                  "{result.problem}"
                </div>
              </div>
            </section>

            <section className="px-4">
              <SectionTitle icon={TrendingUp}>💡 3. 도구 최적화 시 기대효과</SectionTitle>
              <div className="text-slate-800 font-bold text-lg leading-snug break-keep">
                {result.effect}
              </div>
            </section>

            <section className="px-4">
              <SectionTitle icon={Users}>⚔️ 4. 반경 500m 상권 경쟁 진단</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">경쟁 매장</div>
                  <div className="text-2xl font-black text-red-500 flex items-baseline gap-2">
                    {result.competitorCount}
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">AI 알고리즘 자동 추정</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">상권 내 순위 진단</div>
                  <div className="text-slate-800 font-bold">{result.competition}</div>
                </div>
              </div>
            </section>

            <section className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-slate-900 overflow-hidden relative shadow-sm">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-4 flex items-center gap-3 text-slate-900">
                  <Zap className="w-6 h-6 fill-slate-900" />
                  🚀 2일 차 예고: 리뷰/평판 정밀 분석
                </h4>
                <p className="text-base font-bold leading-relaxed text-slate-600 break-keep">
                  {result.reviewProblem}
                </p>
              </div>
            </section>
          </div>

          <footer className="mt-16 text-center">
            <div className="h-px w-24 bg-slate-200 mx-auto mb-6" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">© 2026 Naver Place AI Diagnostic Center</p>
            <p className="text-[9px] text-slate-300 font-medium">Generated by Gemini Advanced Intelligence Engine</p>
          </footer>
        </div>
      </motion.div>

      <motion.button
        disabled={isCapturing}
        whileHover={{ scale: 1.05, translateY: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={downloadImage}
        className={cn(
          "group flex items-center gap-4 px-10 py-5 text-white rounded-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500",
          isCapturing ? "bg-slate-800 cursor-not-allowed" : "bg-slate-950 hover:bg-black border border-white/10"
        )}
      >
        {isCapturing ? (
          <div className="w-6 h-6 border-[3px] border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        ) : (
          <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500 text-emerald-400" />
        )}
        <span className="text-lg tracking-tight uppercase">
          {isCapturing ? "이미지 생성 중..." : "📸 보고서 이미지(.png) 다운로드"}
        </span>
      </motion.button>
    </div>
  );
};
