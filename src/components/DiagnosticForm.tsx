/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreInfo } from '../types';
import { cn } from '../lib/utils';
import { LayoutGrid, Tag, Calendar, MessageSquare, Ticket, Phone, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DiagnosticFormProps {
  onSubmit: (data: StoreInfo) => void;
  isLoading: boolean;
}

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<StoreInfo>({
    placeName: '',
    targetArea: '',
    mainMenu: '',
    keywords: '',
    useBooking: false,
    useTalkTalk: false,
    useCoupon: false,
    useSafeCall: false,
    visitorReviews: 0,
    blogReviews: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (name === 'visitorReviews' || name === 'blogReviews') {
      // Allow multi-digit numbers and filter non-numeric characters
      finalValue = value.replace(/[^0-9]/g, '');
      // Avoid starting with multiple zeros unless it's just "0"
      if (finalValue.length > 1 && finalValue.startsWith('0')) {
        finalValue = finalValue.replace(/^0+/, '');
      }
    } else {
      finalValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const inputClass = "w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm text-white placeholder:text-slate-600";
  const labelClass = "block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1";

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-10 glass-card p-8 md:p-12 rounded-[2.5rem] glow-effect"
    >
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <LayoutGrid className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">📋 1. 매장 기본 정보</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className={labelClass}>매장/플레이스 등록 이름</label>
              <input
                required
                name="placeName"
                value={formData.placeName}
                onChange={handleInputChange}
                placeholder="예: 들밥차반 만수점"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>타겟 지역명</label>
              <input
                required
                name="targetArea"
                value={formData.targetArea}
                onChange={handleInputChange}
                placeholder="예: 만수동"
                className={inputClass}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={labelClass}>핵심 메뉴/업종</label>
              <input
                required
                name="mainMenu"
                value={formData.mainMenu}
                onChange={handleInputChange}
                placeholder="예: 한정식"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>현재 등록된 키워드 (태그)</label>
              <input
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="예: 만수동 맛집"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">🛠️ 2. 네이버 플레이스 도구 세팅 여부 (체크)</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6 ml-1">현재 사장님 매장에 활성화되어 있는 도구만 체크해 주세요.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'useBooking', label: '네이버 예약', icon: Calendar, color: 'text-emerald-400' },
            { id: 'useTalkTalk', label: '네이버 톡톡', icon: MessageSquare, color: 'text-emerald-400' },
            { id: 'useCoupon', label: '네이버 쿠폰', icon: Ticket, color: 'text-emerald-400' },
            { id: 'useSafeCall', label: '안심번호(스마트콜)', icon: Phone, color: 'text-emerald-400' },
          ].map((tool) => (
            <label 
              key={tool.id}
              className={cn(
                "group relative flex flex-col gap-4 p-6 rounded-2xl border cursor-pointer transition-all duration-500",
                formData[tool.id as keyof StoreInfo] 
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]" 
                  : "bg-slate-900/30 border-slate-700/50 opacity-40 hover:opacity-100 hover:bg-slate-800/40"
              )}
            >
              <input
                type="checkbox"
                name={tool.id}
                checked={!!formData[tool.id as keyof StoreInfo]}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex justify-between items-start">
                <tool.icon className={cn("w-7 h-7", tool.color)} />
                {formData[tool.id as keyof StoreInfo] && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="bg-emerald-500 rounded-full p-1 shadow-lg shadow-emerald-500/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
              <span className="text-[13px] font-black text-slate-200 mt-2 uppercase tracking-tight">{tool.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-12 border-t border-white/5">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Tag className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">📊 3. 매장 리뷰 데이터</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <NumericInput 
            label="방문자 리뷰 수" 
            name="visitorReviews" 
            value={formData.visitorReviews} 
            onChange={handleInputChange}
            onStep={(val) => setFormData(p => ({ ...p, visitorReviews: val }))}
          />
          <NumericInput 
            label="블로그 리뷰 수" 
            name="blogReviews" 
            value={formData.blogReviews} 
            onChange={handleInputChange}
            onStep={(val) => setFormData(p => ({ ...p, blogReviews: val }))}
          />
        </div>
      </div>

      <div className="pt-8">
        <motion.button
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className={cn(
            "w-full py-6 rounded-[1.5rem] text-xl font-black text-white transition-all shadow-2xl relative overflow-hidden group",
            isLoading 
              ? "bg-slate-800 cursor-not-allowed" 
              : "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20"
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-6 h-6 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              <span className="tracking-tight uppercase">데이터 분석 중...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 tracking-tight">🚀 정밀 보고서 생성 및 이미지 추출</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

// Helper component for styled numeric inputs
const NumericInput = ({ 
  label, 
  name, 
  value, 
  onChange,
  onStep
}: { 
  label: string, 
  name: string, 
  value: number | string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onStep: (val: string) => void
}) => {
  const labelClass = "block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1";
  
  return (
    <div className="flex-1">
      <label className={labelClass}>{label}</label>
      <div className="relative flex items-center bg-slate-900/80 border border-slate-700/50 rounded-[2rem] h-24 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all shadow-inner group">
        
        {/* Absolute Centered Input Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <input
            type="text"
            inputMode="numeric"
            name={name}
            value={value === 0 && typeof value === 'number' ? '0' : value}
            onChange={onChange}
            onFocus={(e) => e.target.select()}
            placeholder="0"
            className="w-full h-full bg-transparent px-20 text-3xl sm:text-4xl text-white font-black outline-hidden text-center placeholder:text-slate-800 transition-all z-10"
          />
        </div>

        {/* Minus Button */}
        <button
          type="button"
          onClick={() => {
            const current = parseInt(String(value)) || 0;
            const nextValue = Math.max(0, current - 1);
            onStep(String(nextValue));
          }}
          className="absolute left-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800/40 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90 z-20"
        >
          <span className="text-3xl font-light">−</span>
        </button>

        {/* Plus Button */}
        <button
          type="button"
          onClick={() => {
            const current = parseInt(String(value)) || 0;
            const nextValue = current + 1;
            onStep(String(nextValue));
          }}
          className="absolute right-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800/40 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90 z-20"
        >
          <span className="text-3xl font-light">+</span>
        </button>
      </div>
    </div>
  );
};
