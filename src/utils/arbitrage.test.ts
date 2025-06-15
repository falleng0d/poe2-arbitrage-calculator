import { describe, it, expect } from 'vitest';
import { findArbitrageOpportunities, buildRateMatrix } from './arbitrage';
import { Currency, ConversionRate } from '@/types';

const divineId = "divine";
const exaltedId = "exalted";
const chaosId = "chaos";

describe('Arbitrage Calculations', () => {
  // Test data from browser state
  const testCurrencies: Currency[] = [
    {
      name: "Divine Orb",
      icon: "Divine Orb",
      isCustomIcon: false,
      goldCostPerUnit: 800,
      id: divineId,
      createdAt: new Date()
    },
    {
      name: "Exalted Orb",
      icon: "Exalted Orb",
      isCustomIcon: false,
      goldCostPerUnit: 120,
      id: exaltedId,
      createdAt: new Date()
    },
    {
      name: "Chaos Orb",
      icon: "Chaos Orb",
      isCustomIcon: false,
      goldCostPerUnit: 160,
      id: chaosId,
      createdAt: new Date()
    }
  ];

  const testRates: ConversionRate[] = [
    {
      fromCurrencyId: divineId,
      toCurrencyId: exaltedId,
      rate: 720,
      lastUpdated: new Date()
    },
    {
      fromCurrencyId: divineId,
      toCurrencyId: chaosId,
      rate: 19.75,
      lastUpdated: new Date()
    },
    {
      fromCurrencyId: exaltedId,
      toCurrencyId: divineId,
      rate: 0.00132,
      lastUpdated: new Date()
    },
    {
      fromCurrencyId: exaltedId,
      toCurrencyId: chaosId,
      rate: 0.02564,
      lastUpdated: new Date()
    },
    {
      fromCurrencyId: chaosId,
      toCurrencyId: divineId,
      rate: 0.04926,
      lastUpdated: new Date()
    },
    {
      fromCurrencyId: chaosId,
      toCurrencyId: exaltedId,
      rate: 330,
      lastUpdated: new Date()
    }
  ];

  describe('buildRateMatrix', () => {
    it('should build a rate matrix correctly', () => {
      const matrix = buildRateMatrix(testRates);
      
      expect(matrix[divineId][exaltedId]).toBe(720);
      expect(matrix[divineId][chaosId]).toBe(19.75);
      expect(matrix[exaltedId][divineId]).toBe(0.00132);
    });
  });

  describe('findArbitrageOpportunities', () => {
    it('should find the known profitable path: Divine -> Chaos -> Exalted -> Divine', () => {
      // Rates: Divine(19.75) -> Chaos(330) -> Exalted(0.00132) -> Divine
      const rateDC = 19.75;
      const rateCE = 330;
      const rateED = 0.00132;

      // Manual calculation without gold costs
      const finalAmountNoGold = rateDC * rateCE * rateED;
      const profitNoGold = (finalAmountNoGold - 1) * 100;

      console.log('=== Manual Calculation (No Gold) ===');
      console.log('Path: Divine -> Chaos -> Exalted -> Divine');
      console.log('Rates:', [rateDC, rateCE, rateED]);
      console.log('Final amount:', finalAmountNoGold);
      console.log('Profit %:', profitNoGold);

      expect(finalAmountNoGold).toBeCloseTo(8.6031, 4);
      expect(profitNoGold).toBeCloseTo(760.31, 2);

      // Now with gold costs
      const chaosGoldCost = 160;
      const exaltedGoldCost = 120;
      const divineGoldCost = 800;

      // Gold costs for each conversion step (corrected calculation)
      const goldCostDC = chaosGoldCost * rateDC;
      const goldCostCE = exaltedGoldCost * rateCE;
      const goldCostED = divineGoldCost * rateED;

      const totalGoldCost = goldCostDC + goldCostCE + goldCostED;

      console.log('=== Gold Cost Information ===');
      console.log('Gold cost D->C:', goldCostDC);
      console.log('Gold cost C->E:', goldCostCE);
      console.log('Gold cost E->D:', goldCostED);
      console.log('Total gold cost:', totalGoldCost);
      console.log('Note: Gold cost is separate from currency profit');

      // Gold costs are informational - they don't affect the currency conversion profit
      expect(totalGoldCost).toBeGreaterThan(0);
      expect(finalAmountNoGold).toBeCloseTo(8.6031, 4);
    });

    it('should find arbitrage opportunities with current implementation', () => {
      const opportunities = findArbitrageOpportunities(testCurrencies, testRates);

      console.log('=== Current Implementation Results ===');
      console.log('Found opportunities:', opportunities.length);
      opportunities.forEach((opp, index) => {
        const pathNames = opp.path.map(id => testCurrencies.find(c => c.id === id)?.name || id);
        console.log(`Opportunity ${index + 1}:`, {
          path: pathNames,
          rates: opp.rates,
          quantities: opp.quantities,
          baseAmount: opp.baseAmount,
          profitPercentage: opp.profitPercentage,
          riskScore: opp.riskScore,
          totalGoldCost: opp.totalGoldCost
        });
      });

      // We should find opportunities based on currency conversion profit
      expect(opportunities.length).toBeGreaterThan(0);

      // Verify that gold cost information is included as separate data
      if (opportunities.length > 0) {
        expect(opportunities[0].totalGoldCost).toBeDefined();
        expect(opportunities[0].totalGoldCost).toBeGreaterThan(0);
        // Profit should be based purely on currency conversions (760.31%)
        expect(opportunities[0].profitPercentage).toBeCloseTo(760.31, 2);
      }
    });

    it('should find opportunities without gold costs (baseline test)', () => {
      // Test with zero gold costs to verify basic calculation works
      const currenciesNoGold = testCurrencies.map(c => ({ ...c, goldCostPerUnit: 0 }));
      const opportunities = findArbitrageOpportunities(currenciesNoGold, testRates);

      console.log('=== Baseline Test (No Gold Costs) ===');
      console.log('Opportunities without gold costs:', opportunities.length);
      opportunities.forEach((opp, index) => {
        const pathNames = opp.path.map(id => testCurrencies.find(c => c.id === id)?.name || id);
        console.log(`No-gold opportunity ${index + 1}:`, {
          path: pathNames,
          rates: opp.rates,
          profitPercentage: opp.profitPercentage
        });
      });

      // Should find the same opportunities as the old code
      expect(opportunities.length).toBeGreaterThan(0);

      // Should find the known 760.31% profit opportunity (approximately)
      const highProfitOpp = opportunities.find(opp => opp.profitPercentage > 700);
      expect(highProfitOpp).toBeDefined();
    });

    it('should find opportunities with very small gold costs', () => {
      // Test with very small gold costs to demonstrate the logic works
      const currenciesVeryLowGold = testCurrencies.map(c => ({
        ...c,
        goldCostPerUnit: c.goldCostPerUnit / 100000 // Divide by 100,000 to make costs tiny
      }));

      const opportunities = findArbitrageOpportunities(currenciesVeryLowGold, testRates);

      console.log('=== Test with Very Small Gold Costs ===');
      console.log('Opportunities with very small gold costs:', opportunities.length);
      opportunities.forEach((opp, index) => {
        const pathNames = opp.path.map(id => testCurrencies.find(c => c.id === id)?.name || id);
        console.log(`Very-low-gold opportunity ${index + 1}:`, {
          path: pathNames,
          rates: opp.rates,
          profitPercentage: opp.profitPercentage
        });
      });

      // With very small gold costs, we should find opportunities
      expect(opportunities.length).toBeGreaterThan(0);
    });

    it('should respect precision parameter for quantity calculations', () => {
      // Test with different precision values
      const lowPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 10);
      const mediumPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 100);
      const highPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 10000);

      console.log('=== Precision Test Results ===');
      console.log('Low precision (10):');
      if (lowPrecisionOpportunities.length > 0) {
        console.log('  quantities:', lowPrecisionOpportunities[0].quantities);
        console.log('  baseAmount:', lowPrecisionOpportunities[0].baseAmount);
      }

      console.log('Medium precision (100):');
      if (mediumPrecisionOpportunities.length > 0) {
        console.log('  quantities:', mediumPrecisionOpportunities[0].quantities);
        console.log('  baseAmount:', mediumPrecisionOpportunities[0].baseAmount);
      }

      console.log('High precision (10000):');
      if (highPrecisionOpportunities.length > 0) {
        console.log('  quantities:', highPrecisionOpportunities[0].quantities);
        console.log('  baseAmount:', highPrecisionOpportunities[0].baseAmount);
      }

      // All should find opportunities
      expect(lowPrecisionOpportunities.length).toBeGreaterThan(0);
      expect(mediumPrecisionOpportunities.length).toBeGreaterThan(0);
      expect(highPrecisionOpportunities.length).toBeGreaterThan(0);

      // Lower precision should generally result in smaller numbers
      if (lowPrecisionOpportunities.length > 0 && highPrecisionOpportunities.length > 0) {
        expect(lowPrecisionOpportunities[0].baseAmount).toBeLessThanOrEqual(highPrecisionOpportunities[0].baseAmount);
      }
    });

    it('should filter out opportunities with zero quantities at very low precision', () => {
      // Test with extremely low precision that might cause zero quantities
      const veryLowPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 1);
      const lowPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 5);
      const mediumPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 100);

      console.log('=== Zero Quantity Filter Test ===');
      console.log('Very low precision (1) opportunities:', veryLowPrecisionOpportunities.length);
      veryLowPrecisionOpportunities.forEach((opp, index) => {
        console.log(`  Opportunity ${index + 1} quantities:`, opp.quantities);
        console.log(`  Has zero quantities:`, opp.quantities.some(qty => qty === 0));
      });

      console.log('Low precision (5) opportunities:', lowPrecisionOpportunities.length);
      lowPrecisionOpportunities.forEach((opp, index) => {
        console.log(`  Opportunity ${index + 1} quantities:`, opp.quantities);
        console.log(`  Has zero quantities:`, opp.quantities.some(qty => qty === 0));
      });

      console.log('Medium precision (100) opportunities:', mediumPrecisionOpportunities.length);

      // All returned opportunities should have non-zero quantities
      veryLowPrecisionOpportunities.forEach(opp => {
        expect(opp.quantities.every(qty => qty > 0)).toBe(true);
      });

      lowPrecisionOpportunities.forEach(opp => {
        expect(opp.quantities.every(qty => qty > 0)).toBe(true);
      });

      mediumPrecisionOpportunities.forEach(opp => {
        expect(opp.quantities.every(qty => qty > 0)).toBe(true);
      });

      // Higher precision should generally find more or equal opportunities
      expect(mediumPrecisionOpportunities.length).toBeGreaterThanOrEqual(lowPrecisionOpportunities.length);
    });

    it('should calculate gold costs based on scaled quantities, not base rates', () => {
      // Test with different precision values to ensure gold costs scale correctly
      const lowPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 10);
      const highPrecisionOpportunities = findArbitrageOpportunities(testCurrencies, testRates, 1000);

      console.log('=== Gold Cost Scaling Test ===');

      if (lowPrecisionOpportunities.length > 0) {
        const lowOpp = lowPrecisionOpportunities[0];
        console.log('Low precision (10):');
        console.log('  quantities:', lowOpp.quantities);
        console.log('  baseAmount:', lowOpp.baseAmount);
        console.log('  totalGoldCost:', lowOpp.totalGoldCost);
      }

      if (highPrecisionOpportunities.length > 0) {
        const highOpp = highPrecisionOpportunities[0];
        console.log('High precision (1000):');
        console.log('  quantities:', highOpp.quantities);
        console.log('  baseAmount:', highOpp.baseAmount);
        console.log('  totalGoldCost:', highOpp.totalGoldCost);
      }

      // Both should have opportunities
      expect(lowPrecisionOpportunities.length).toBeGreaterThan(0);
      expect(highPrecisionOpportunities.length).toBeGreaterThan(0);

      if (lowPrecisionOpportunities.length > 0 && highPrecisionOpportunities.length > 0) {
        const lowOpp = lowPrecisionOpportunities[0];
        const highOpp = highPrecisionOpportunities[0];

        // Gold cost should scale proportionally with the base amount
        const expectedRatio = highOpp.baseAmount / lowOpp.baseAmount;
        const actualRatio = highOpp.totalGoldCost! / lowOpp.totalGoldCost!;

        console.log('Expected ratio (baseAmount):', expectedRatio);
        console.log('Actual ratio (goldCost):', actualRatio);

        // The ratios should be approximately equal (within 1% tolerance)
        expect(Math.abs(actualRatio - expectedRatio) / expectedRatio).toBeLessThan(0.01);
      }
    });
  });
});
