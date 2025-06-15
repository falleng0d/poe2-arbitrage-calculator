import { ArbitrageOpportunity, ConversionRate, Currency, RateMatrix } from '@/types';

export const buildRateMatrix = (rates: ConversionRate[]): RateMatrix => {
  const matrix: RateMatrix = {};
  
  rates.forEach(rate => {
    if (!matrix[rate.fromCurrencyId]) {
      matrix[rate.fromCurrencyId] = {};
    }
    matrix[rate.fromCurrencyId][rate.toCurrencyId] = rate.rate;
  });
  
  return matrix;
};

export const findArbitrageOpportunities = (
  currencies: Currency[],
  rates: ConversionRate[]
): ArbitrageOpportunity[] => {
  const matrix = buildRateMatrix(rates);
  const opportunities: ArbitrageOpportunity[] = [];
  const currencyIds = currencies.map(c => c.id);

  // Find triangular arbitrage opportunities
  for (let i = 0; i < currencyIds.length; i++) {
    for (let j = 0; j < currencyIds.length; j++) {
      for (let k = 0; k < currencyIds.length; k++) {
        if (i === j || j === k || i === k) continue;

        const currencyA = currencyIds[i];
        const currencyB = currencyIds[j];
        const currencyC = currencyIds[k];

        const rateAB = matrix[currencyA]?.[currencyB];
        const rateBC = matrix[currencyB]?.[currencyC];
        const rateCA = matrix[currencyC]?.[currencyA];

        if (rateAB && rateBC && rateCA) {
          const finalAmount = rateAB * rateBC * rateCA;
          const profitPercentage = (finalAmount - 1) * 100;

          if (profitPercentage > 0.01) { // Only show opportunities with > 0.01% profit
            const riskScore = calculateRiskScore(profitPercentage, [rateAB, rateBC, rateCA]);
            
            opportunities.push({
              id: `${currencyA}-${currencyB}-${currencyC}`,
              path: [currencyA, currencyB, currencyC, currencyA],
              rates: [rateAB, rateBC, rateCA],
              profitPercentage,
              riskScore,
            });
          }
        }
      }
    }
  }

  // Remove duplicates and sort by profit
  const uniqueOpportunities = opportunities.filter((opp, index, arr) => 
    arr.findIndex(o => o.id === opp.id) === index
  );

  return uniqueOpportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
};

const calculateRiskScore = (profitPercentage: number, rates: number[]): number => {
  // Simple risk calculation based on profit percentage and rate volatility
  const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const rateVariance = rates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / rates.length;
  
  // Higher profit usually means higher risk, higher variance means higher risk
  const profitRisk = Math.min(profitPercentage / 10, 5); // Cap at 5
  const varianceRisk = Math.min(rateVariance * 100, 5); // Cap at 5
  
  return Math.min(profitRisk + varianceRisk, 10); // Cap total risk at 10
};

export const formatCurrency = (amount: number, decimals: number = 4): string => {
  return amount.toFixed(decimals);
};

export const getConfidenceScore = (riskScore: number): number => {
  return Math.max(0, Math.min(100, 100 - (riskScore * 10)));
};
