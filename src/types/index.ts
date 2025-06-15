export interface Currency {
  id: string;
  name: string;
  icon: string;
  isCustomIcon?: boolean;
  goldCostPerUnit: number;
  createdAt: Date;
}

export interface ConversionRate {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  lastUpdated: Date;
}

export interface ArbitrageOpportunity {
  id: string;
  path: string[];
  rates: number[];
  profitPercentage: number;
  riskScore: number;
  minAmount?: number;
  maxAmount?: number;
  totalGoldCost?: number;
}

export interface RateMatrix {
  [fromCurrencyId: string]: {
    [toCurrencyId: string]: number;
  };
}

export interface AppState {
  currencies: Currency[];
  rates: ConversionRate[];
  opportunities: ArbitrageOpportunity[];
  activeTab: 'currencies' | 'rates' | 'opportunities';
}