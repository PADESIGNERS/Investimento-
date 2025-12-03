export interface FinancialData {
  btc: number;
  gold: number;
  usd_brl: number;
  lastUpdated: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ApiResponse {
  data: FinancialData | null;
  sources: GroundingSource[];
  rawText: string;
  error?: string;
}

export enum Currency {
  USD = 'USD',
  BRL = 'BRL',
  BTC = 'BTC',
  XAU = 'XAU' // Gold ounce
}