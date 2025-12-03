import { GoogleGenAI } from "@google/genai";
import { ApiResponse } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const fetchMarketData = async (): Promise<ApiResponse> => {
  if (!processEnvApiKey) {
    return {
      data: null,
      sources: [],
      rawText: "",
      error: "API Key não encontrada. Configure process.env.API_KEY."
    };
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  try {
    const model = 'gemini-2.5-flash';
    
    // Prompt otimizado para dados em tempo real
    const prompt = `
      Atue como um terminal financeiro de alta precisão. Utilize o Google Search para encontrar as cotações DE AGORA (Real-Time/Live Price) para os seguintes ativos. Ignore artigos antigos ou previsões de dias anteriores.

      Busque especificamente por:
      1. Preço atual do Bitcoin (BTC) em Dólares Americanos (USD).
      2. Preço atual do Ouro (XAU - Gold Spot Price) por Onça Troy em Dólares Americanos (USD).
      3. Taxa de câmbio comercial atual de Dólar Americano (USD) para Real Brasileiro (BRL).

      IMPORTANTE: Retorne APENAS os dados numéricos brutos no formato abaixo para processamento. Não use formatação markdown no bloco de dados.
      
      DATA_START
      BTC: [valor numérico do BTC em USD, ex: 64230.50]
      GOLD: [valor numérico da onça de Ouro em USD, ex: 2340.10]
      USD_BRL: [valor numérico de 1 USD em BRL, ex: 5.25]
      DATA_END
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title || "Fonte Financeira",
            url: chunk.web.uri || "#"
          };
        }
        return null;
      })
      .filter((s: any) => s !== null) || [];

    // Parse logic
    const dataBlockRegex = /DATA_START([\s\S]*?)DATA_END/;
    const match = text.match(dataBlockRegex);

    if (!match) {
      return {
        data: null,
        sources,
        rawText: text,
        error: "Não foi possível analisar os dados financeiros. O Gemini pode não ter retornado o formato esperado."
      };
    }

    const content = match[1];
    
    // Robust number extraction that handles 65,000.00 and 5,40 formats correctly
    const extractValue = (key: string): number => {
      // Regex looks for Key: followed by numbers, dots or commas
      const regex = new RegExp(`${key}:\\s*([\\d.,]+)`);
      const valMatch = content.match(regex);
      
      if (valMatch && valMatch[1]) {
        let rawNum = valMatch[1].trim();
        
        // Remove 'thousands' separators if present to sanitize
        // Logic: If string has both ',' and '.', assuming English format (remove , keep .)
        // or Portuguese format (remove . keep ,) depends on position, but standardized API usually returns English.
        // Let's assume the model tries to follow the examples (English format).
        
        // However, if the model gets confused and returns "5,25" for BRL:
        if (rawNum.includes(',') && !rawNum.includes('.')) {
            // Likely "5,25" -> replace comma with dot
            rawNum = rawNum.replace(',', '.');
        } else if (rawNum.includes(',') && rawNum.includes('.')) {
            // Likely "65,000.50" -> remove comma
            rawNum = rawNum.replace(/,/g, '');
        }
        
        const parsed = parseFloat(rawNum);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const btc = extractValue('BTC');
    const gold = extractValue('GOLD');
    const usd_brl = extractValue('USD_BRL');

    return {
      data: {
        btc,
        gold,
        usd_brl,
        lastUpdated: new Date().toLocaleTimeString('pt-BR')
      },
      sources,
      rawText: text
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      data: null,
      sources: [],
      rawText: "",
      error: error instanceof Error ? error.message : "Erro desconhecido ao conectar com a API."
    };
  }
};