import { useEffect, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { CurrencyManagement } from '@/components/CurrencyManagement';
import { RateConfiguration } from '@/components/RateConfiguration';
import { ArbitrageDashboard } from '@/components/ArbitrageDashboard';
import { Toaster } from '@/components/ui/toaster';
import { AppState, ConversionRate, Currency } from '@/types';
import { storage } from '@/utils/storage';
import { findArbitrageOpportunities } from '@/utils/arbitrage';
import './App.css';

function App() {
  const [state, setState] = useState<AppState>({
    currencies: [],
    rates: [],
    opportunities: [],
  });
  const [precision, setPrecision] = useState(1000);

  useEffect(() => {
    console.log(state);
  }, [state])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCurrencies = storage.loadCurrencies();
    const savedRates = storage.loadRates();
    
    setState(prev => ({
      ...prev,
      currencies: savedCurrencies,
      rates: savedRates,
    }));
  }, []);

  // Calculate arbitrage opportunities when currencies, rates, or precision change
  const opportunities = useMemo(() => {
    if (state.currencies.length < 3 || state.rates.length === 0) {
      return [];
    }
    const opportunities = findArbitrageOpportunities(state.currencies, state.rates, precision);
    console.log('opportunities', opportunities);
    return opportunities;
  }, [state.currencies, state.rates, precision]);

  // Update opportunities when they change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      opportunities,
    }));
  }, [opportunities]);

  const handleAddCurrency = (currencyData: Omit<Currency, 'id' | 'createdAt'>) => {
    const newCurrency: Currency = {
      ...currencyData,
      id: `currency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    const updatedCurrencies = [...state.currencies, newCurrency];
    setState(prev => ({ ...prev, currencies: updatedCurrencies }));
    storage.saveCurrencies(updatedCurrencies);
  };

  const handleUpdateCurrency = (id: string, updates: Partial<Currency>) => {
    const updatedCurrencies = state.currencies.map(currency =>
      currency.id === id ? { ...currency, ...updates } : currency
    );
    setState(prev => ({ ...prev, currencies: updatedCurrencies }));
    console.log('Updated currencies:', updatedCurrencies);
    storage.saveCurrencies(updatedCurrencies);
  };

  const handleDeleteCurrency = (id: string) => {
    const updatedCurrencies = state.currencies.filter(currency => currency.id !== id);
    const updatedRates = state.rates.filter(
      rate => rate.fromCurrencyId !== id && rate.toCurrencyId !== id
    );
    
    setState(prev => ({ 
      ...prev, 
      currencies: updatedCurrencies, 
      rates: updatedRates 
    }));
    storage.saveCurrencies(updatedCurrencies);
    storage.saveRates(updatedRates);
  };

  const handleUpdateRates = (newRates: ConversionRate[]) => {
    setState(prev => ({ ...prev, rates: newRates }));
    storage.saveRates(newRates);
  };

  const handlePrecisionChange = (newPrecision: number) => setPrecision(newPrecision);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pb-8">
        <Routes>
          <Route
            path="/"
            element={
              <ArbitrageDashboard
                currencies={state.currencies}
                opportunities={state.opportunities}
                rates={state.rates}
                onPrecisionChange={handlePrecisionChange}
              />
            }
          />
          <Route
            path="/rates"
            element={
              <RateConfiguration
                currencies={state.currencies}
                rates={state.rates}
                onUpdateRates={handleUpdateRates}
              />
            }
          />
          <Route
            path="/currencies"
            element={
              <CurrencyManagement
                currencies={state.currencies}
                onAddCurrency={handleAddCurrency}
                onUpdateCurrency={handleUpdateCurrency}
                onDeleteCurrency={handleDeleteCurrency}
              />
            }
          />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
