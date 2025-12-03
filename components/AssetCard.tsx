import React from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';

interface AssetCardProps {
  title: string;
  value: number | null;
  currencyPrefix: string;
  subValue?: string;
  icon: React.ReactNode;
  isLoading: boolean;
  colorClass: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({ 
  title, 
  value, 
  currencyPrefix, 
  subValue, 
  icon, 
  isLoading,
  colorClass
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-800 p-6 shadow-lg border border-slate-700 transition-all hover:scale-[1.02] hover:shadow-xl`}>
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full ${colorClass} opacity-10 blur-2xl`}></div>
      
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 ${colorClass} bg-opacity-20 text-white`}>
          {icon}
        </div>
        {value !== null && !isLoading && (
           <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
             <ArrowUpRight size={12} />
             <span>Live</span>
           </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          {isLoading ? (
            <div className="flex h-8 items-center gap-2">
              <Loader2 className="animate-spin text-slate-500" size={24} />
              <span className="text-slate-500 text-lg">Atualizando...</span>
            </div>
          ) : (
            <>
              <span className="text-3xl font-bold text-slate-50">
                {currencyPrefix} {value?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </>
          )}
        </div>
        {subValue && !isLoading && (
          <p className="mt-1 text-xs text-slate-500">{subValue}</p>
        )}
      </div>
    </div>
  );
};