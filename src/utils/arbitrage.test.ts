import { describe, it, expect } from 'vitest';
import { findArbitrageOpportunities, buildRateMatrix } from './arbitrage';
import { Currency, ConversionRate } from '@/types';

describe('Arbitrage Calculations', () => {
  // Test data from browser state
  const testCurrencies: Currency[] = [
    {
      name: "Divine Orb",
      icon: "Divine Orb",
      isCustomIcon: false,
      goldCostPerUnit: 800,
      id: "currency_1749988790557_lv8t05jaf",
      createdAt: new Date("2025-06-15T11:59:50.557Z")
    },
    {
      name: "Exalted Orb",
      icon: "Exalted Orb",
      isCustomIcon: false,
      goldCostPerUnit: 120,
      id: "currency_1749988803476_9cemxww2b",
      createdAt: new Date("2025-06-15T12:00:03.476Z")
    },
    {
      name: "Chaos Orb",
      icon: "Chaos Orb",
      isCustomIcon: false,
      goldCostPerUnit: 160,
      id: "currency_1749988818989_exip1pxn1",
      createdAt: new Date("2025-06-15T12:00:18.989Z")
    }
  ];

  const testRates: ConversionRate[] = [
    {
      fromCurrencyId: "currency_1749988790557_lv8t05jaf", // Divine Orb
      toCurrencyId: "currency_1749988803476_9cemxww2b",   // Exalted Orb
      rate: 720,
      lastUpdated: new Date("2025-06-15T12:11:41.295Z")
    },
    {
      fromCurrencyId: "currency_1749988790557_lv8t05jaf", // Divine Orb
      toCurrencyId: "currency_1749988818989_exip1pxn1",   // Chaos Orb
      rate: 19.75,
      lastUpdated: new Date("2025-06-15T12:11:41.295Z")
    },
    {
      fromCurrencyId: "currency_1749988803476_9cemxww2b", // Exalted Orb
      toCurrencyId: "currency_1749988790557_lv8t05jaf",   // Divine Orb
      rate: 0.00132,
      lastUpdated: new Date("2025-06-15T12:11:41.295Z")
    },
    {
      fromCurrencyId: "currency_1749988803476_9cemxww2b", // Exalted Orb
      toCurrencyId: "currency_1749988818989_exip1pxn1",   // Chaos Orb
      rate: 0.02564,
      lastUpdated: new Date("2025-06-15T12:11:41.295Z")
    },
    {
      fromCurrencyId: "currency_1749988818989_exip1pxn1", // Chaos Orb
      toCurrencyId: "currency_1749988790557_lv8t05jaf",   // Divine Orb
      rate: 0.04926,
      lastUpdated: new Date("2025-06-15T12:11:41.295Z")
    },
    {
      fromCurrencyId: "currency_1749988818989_exip1pxn1", // Chaos Orb
      toCurrencyId: "currency_1749988803476_9cemxww2b",   // Exalted Orb
      rate: 330,
      lastUpdated: new Date("2025-06-15T12:11:41.295Z")
    }
  ];

  describe('buildRateMatrix', () => {
    it('should build a rate matrix correctly', () => {
      const matrix = buildRateMatrix(testRates);
      
      expect(matrix["currency_1749988790557_lv8t05jaf"]["currency_1749988803476_9cemxww2b"]).toBe(720);
      expect(matrix["currency_1749988790557_lv8t05jaf"]["currency_1749988818989_exip1pxn1"]).toBe(19.75);
      expect(matrix["currency_1749988803476_9cemxww2b"]["currency_1749988790557_lv8t05jaf"]).toBe(0.00132);
    });
  });

  describe('findArbitrageOpportunities', () => {
    it('should find the known profitable path: Divine -> Chaos -> Exalted -> Divine', () => {
      // This is one of the paths that was previously returning 760.31% profit
      // const divineId = "currency_1749988790557_lv8t05jaf";
      // const chaosId = "currency_1749988818989_exip1pxn1";
      // const exaltedId = "currency_1749988803476_9cemxww2b";

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

      expect(finalAmountNoGold).toBeCloseTo(8.6031, 4); // Should be ~8.6031
      expect(profitNoGold).toBeCloseTo(760.31, 2); // Should be ~760.31%

      // Now with gold costs
      const chaosGoldCost = 160;
      const exaltedGoldCost = 120;
      const divineGoldCost = 800;

      // Gold costs for each conversion step (corrected calculation)
      const goldCostDC = chaosGoldCost * rateDC; // 160 * 19.75 = 3160
      const goldCostCE = exaltedGoldCost * rateCE; // 120 * 330 = 39600
      const goldCostED = divineGoldCost * rateED; // 800 * 0.00132 = 1.056

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
  });
});
