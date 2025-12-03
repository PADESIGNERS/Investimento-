import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchMarketData } from './services/geminiService';
import { ApiResponse } from './types';
import { AssetCard } from './components/AssetCard';
import { Converter } from './components/Converter';
import { RefreshCw, TrendingUp, Bitcoin, DollarSign, Coins, AlertCircle, ExternalLink } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ApiResponse['data']>(null);
  const [sources, setSources] = useState<ApiResponse['sources']>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await fetchMarketData();
    
    if (response.error) {
      setError(response.error);
    } else {
      setData(response.data);
      setSources(response.sources);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Calculate implied BRL prices
  const { btcInBrl, goldInBrl } = useMemo(() => {
    if (!data || !data.btc || !data.gold || !data.usd_brl) {
        return { btcInBrl: null, goldInBrl: null };
    }
    return {
        btcInBrl: data.btc * data.usd_brl,
        goldInBrl: data.gold * data.usd_brl
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 md:px-8 font-sans">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white tracking-tight">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                <TrendingUp size={24} />
              </div>
              Finanças Flash
            </h1>
            <p className="mt-2 text-slate-400">
              Monitoramento de ativos em tempo real de fontes confiáveis
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className={`group flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            {loading ? "Atualizando..." : "Atualizar Dados"}
          </button>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Erro ao carregar dados</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          <AssetCard 
            title="Dólar Americano (USD)"
            value={data?.usd_brl || null}
            currencyPrefix="R$"
            subValue="Cotação Oficial"
            icon={<DollarSign size={28} className="text-emerald-400" />}
            isLoading={loading}
            colorClass="bg-emerald-500"
          />

          <AssetCard 
            title="Bitcoin (BTC)"
            value={data?.btc || null}
            currencyPrefix="$"
            subValue={btcInBrl ? `≈ R$ ${btcInBrl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}` : "Carregando..."}
            icon={<Bitcoin size={28} className="text-orange-500" />}
            isLoading={loading}
            colorClass="bg-orange-500"
          />

          <AssetCard 
            title="Ouro (XAU)"
            value={data?.gold || null}
            currencyPrefix="$"
            subValue={goldInBrl ? `≈ R$ ${goldInBrl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} / oz` : "Carregando..."}
            icon={<Coins size={28} className="text-yellow-400" />}
            isLoading={loading}
            colorClass="bg-yellow-400"
          />

        </div>

        {/* Converter Section */}
        <Converter data={data} />

        {/* Footer / Sources */}
        <footer className="mt-12 border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
             <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Fontes Confiáveis Verificadas
             </h4>
             {data?.lastUpdated && (
                <span className="text-xs text-slate-600 bg-slate-800/50 px-3 py-1 rounded-full">
                    Última verificação: {data.lastUpdated}
                </span>
             )}
          </div>
          
          {sources.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-indigo-400 border border-transparent hover:border-slate-700"
                >
                  <span className="truncate pr-2">{source.title}</span>
                  <ExternalLink size={12} className="shrink-0 opacity-50" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 italic">
              {loading ? "Consultando fontes..." : "Nenhuma fonte específica retornada."}
            </p>
          )}

          <div className="mt-8 text-center text-xs text-slate-600">
            <p>
              Os valores são obtidos através de análise de dados de múltiplas fontes financeiras confiáveis.
              Pode haver pequenos atrasos ou variações em relação a terminais de trading profissional.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}