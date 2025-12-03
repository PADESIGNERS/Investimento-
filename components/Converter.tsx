import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { FinancialData } from '../types';

interface ConverterProps {
  data: FinancialData | null;
}

export const Converter: React.FC<ConverterProps> = ({ data }) => {
  const [brlAmount, setBrlAmount] = useState<string>('1000');
  const [resultUSD, setResultUSD] = useState<number>(0);
  const [resultBTC, setResultBTC] = useState<number>(0);
  const [resultGold, setResultGold] = useState<number>(0);

  useEffect(() => {
    if (!data || !data.usd_brl) return;
    
    const val = parseFloat(brlAmount);
    if (isNaN(val)) {
        setResultUSD(0);
        setResultBTC(0);
        setResultGold(0);
        return;
    }

    // Input is BRL
    const amountInBRL = val;

    // Convert BRL to USD (Amount / Rate)
    const amountInUSD = amountInBRL / data.usd_brl;
    
    setResultUSD(amountInUSD);
    
    // Convert USD equivalent to BTC
    // amountInUSD / price_of_one_btc
    setResultBTC(amountInUSD / data.btc);

    // Convert USD equivalent to Gold Ounces
    setResultGold(amountInUSD / data.gold);

  }, [brlAmount, data]);

  if (!data) return null;

  return (
    <div className="mt-8 rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <Calculator size={24} />
        </div>
        <div>
            <h2 className="text-xl font-semibold text-slate-100">Calculadora de Poder de Compra</h2>
            <p className="text-xs text-slate-400">Simule quanto vale seu dinheiro nos ativos globais</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300 uppercase tracking-wide">Valor em Reais (R$)</label>
          <div className="relative group">
            <input
              type="number"
              value={brlAmount}
              onChange={(e) => setBrlAmount(e.target.value)}
              className="block w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-5 text-3xl font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-700"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded text-sm">BRL</span>
          </div>
          <p className="text-xs text-slate-500">
            Digite o valor em Reais que você deseja converter.
          </p>
        </div>

        {/* Results Section */}
        <div className="space-y-3">
            {/* USD Result */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/50 p-4 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                        <span className="text-lg font-bold">$</span>
                    </div>
                    <div>
                        <span className="block font-medium text-slate-200">Dólar Americano</span>
                        <span className="text-xs text-slate-500">Saldo em USD</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">
                        US$ {resultUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* BTC Result */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/50 p-4 border border-slate-700/50 hover:border-orange-500/30 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-full text-orange-400">
                        <span className="text-lg font-bold">₿</span>
                    </div>
                    <div>
                        <span className="block font-medium text-slate-200">Bitcoin</span>
                        <span className="text-xs text-slate-500">Fração de BTC</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-orange-400">
                        {resultBTC.toFixed(8)} BTC
                    </div>
                </div>
            </div>

            {/* Gold Result */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/50 p-4 border border-slate-700/50 hover:border-yellow-500/30 transition-colors">
                <div className="flex items-center gap-3">
                     <div className="bg-yellow-500/20 p-2 rounded-full text-yellow-400">
                        <span className="text-lg font-bold">⚱️</span>
                    </div>
                    <div>
                        <span className="block font-medium text-slate-200">Ouro</span>
                        <span className="text-xs text-slate-500">Onças Troy (oz)</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                        {resultGold.toFixed(4)} oz
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};