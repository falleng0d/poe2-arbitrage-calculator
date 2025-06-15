import { ArbitrageOpportunity, ConversionRate, Currency, RateMatrix } from '@/types';

// Helper function to calculate the greatest common divisor
const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

// Helper function to calculate the least common multiple
const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b);
};

// Helper function to find the LCM of an array of numbers
const lcmArray = (numbers: number[]): number => {
  return numbers.reduce((acc, num) => lcm(acc, num), 1);
};

// Convert decimal rates to integer quantities
const calculateQuantities = (rates: number[], precision: number = 1000): { quantities: number[], baseAmount: number } => {
  // Start with base amount of 1 and calculate the chain
  let currentAmount = 1;
  const quantities: number[] = [currentAmount];

  // Calculate quantities through the conversion chain
  for (let i = 0; i < rates.length; i++) {
    currentAmount = currentAmount * rates[i];
    quantities.push(currentAmount);
  }

  // Find the smallest multiplier that makes all quantities integers
  // We'll try different multipliers starting from small values up to the precision limit
  let multiplier = 1;
  let maxIterations = precision; // Use precision as the limit

  while (maxIterations > 0) {
    const testQuantities = quantities.map(qty => qty * multiplier);
    const allIntegers = testQuantities.every(qty => Math.abs(qty - Math.round(qty)) < 0.0001);

    if (allIntegers) {
      // Found a good multiplier, return the integer quantities
      return {
        quantities: testQuantities.map(qty => Math.round(qty)),
        baseAmount: Math.round(multiplier)
      };
    }

    multiplier++;
    maxIterations--;
  }

  // Fallback: use the precision as the multiplier to ensure integers
  return {
    quantities: quantities.map(qty => Math.round(qty * precision)),
    baseAmount: precision
  };
};

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
  rates: ConversionRate[],
  precision: number = 1000
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
          // Get currency objects to access gold costs
          const currencyBObj = currencies.find(c => c.id === currencyB);
          const currencyCObj = currencies.find(c => c.id === currencyC);
          const currencyAObj = currencies.find(c => c.id === currencyA);

          if (currencyBObj && currencyCObj && currencyAObj) {
            // Calculate final amount after conversions (starting with 1 unit of currency A)
            const finalAmount = rateAB * rateBC * rateCA;

            // Calculate profit based purely on currency conversions
            const profitPercentage = (finalAmount - 1) * 100;

            // Show opportunities based on conversion profit, gold cost is separate information
            if (profitPercentage > 0.01) { // Only show opportunities with > 0.01% profit
              const riskScore = calculateRiskScore(profitPercentage, [rateAB, rateBC, rateCA]);

              // Calculate proper quantities for display
              const { quantities, baseAmount } = calculateQuantities([rateAB, rateBC, rateCA], precision);

              // Only include opportunities with non-zero quantities (executable trades)
              const hasValidQuantities = quantities.every(qty => qty > 0);

              if (hasValidQuantities) {
                // Calculate total gold cost based on the actual scaled quantities
                // A->B: Pay goldCostPerUnit of B for each unit of B we want (quantities[1] units)
                const goldCostAB = currencyBObj.goldCostPerUnit * quantities[1];
                // B->C: Pay goldCostPerUnit of C for each unit of C we want (quantities[2] units)
                const goldCostBC = currencyCObj.goldCostPerUnit * quantities[2];
                // C->A: Pay goldCostPerUnit of A for each unit of A we want (quantities[3] units)
                const goldCostCA = currencyAObj.goldCostPerUnit * quantities[3];

                const totalGoldCost = goldCostAB + goldCostBC + goldCostCA;

                opportunities.push({
                  id: `${currencyA}-${currencyB}-${currencyC}`,
                  path: [currencyA, currencyB, currencyC, currencyA],
                  rates: [rateAB, rateBC, rateCA],
                  quantities,
                  baseAmount,
                  profitPercentage,
                  riskScore,
                  totalGoldCost,
                });
              }
            }
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
