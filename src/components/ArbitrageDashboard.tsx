import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { ArbitrageOpportunity, Currency, ConversionRate } from '@/types';
import { formatCurrency, getConfidenceScore } from '@/utils/arbitrage';
import { IconDisplay } from '@/components/app/IconDisplay';
import { SearchInput } from '@/components/app/SearchInput';
import { SortBySelect } from '@/components/app/SortBySelect';
import { RiskFilterSelect } from '@/components/app/RiskFilterSelect';
import { BaseCurrencyFilterSelect } from '@/components/app/BaseCurrencyFilterSelect';
import { PrecisionInput } from '@/components/app/PrecisionInput';

interface ArbitrageDashboardProps {
  currencies: Currency[];
  opportunities: ArbitrageOpportunity[];
  rates: ConversionRate[];
  onPrecisionChange?: (precision: number) => void;
}

interface ArbitrageDashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  precision: number;
  onPrecisionChange: (precision: number) => void;
  sortBy: 'profit' | 'risk' | 'confidence';
  onSortChange: (value: 'profit' | 'risk' | 'confidence') => void;
  filterByRisk: 'all' | 'low' | 'medium' | 'high';
  onRiskFilterChange: (value: 'all' | 'low' | 'medium' | 'high') => void;
  currencies: Currency[];
  filterByBaseCurrency: string;
  onBaseCurrencyFilterChange: (value: string) => void;
}

const ArbitrageDashboardHeader = ({
  searchTerm,
  onSearchChange,
  precision,
  onPrecisionChange,
  sortBy,
  onSortChange,
  filterByRisk,
  onRiskFilterChange,
  currencies,
  filterByBaseCurrency,
  onBaseCurrencyFilterChange,
}: ArbitrageDashboardHeaderProps) => (
  <div className="flex items-center justify-between">
    <h2 className="text-3xl font-bold text-foreground">Arbitrage Opportunities</h2>
    <div className="flex items-center space-x-2">
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Search currencies..."
      />
      <PrecisionInput
        precision={precision}
        onPrecisionChange={onPrecisionChange}
      />
      <SortBySelect
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
      <RiskFilterSelect
        filterByRisk={filterByRisk}
        onRiskFilterChange={onRiskFilterChange}
      />
      <BaseCurrencyFilterSelect
        currencies={currencies}
        filterByBaseCurrency={filterByBaseCurrency}
        onBaseCurrencyFilterChange={onBaseCurrencyFilterChange}
      />
    </div>
  </div>
);

interface ArbitrageDashboardStatsProps {
  stats: {
    profitable: number;
    avgProfit: number;
    bestOpportunity: number;
  };
}

const ArbitrageDashboardStats = ({ stats }: ArbitrageDashboardStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{stats.profitable}</span>
          <span className="text-sm text-muted-foreground">profitable</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Average Profit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.avgProfit, 2)}%
          </span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Best Opportunity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(stats.bestOpportunity, 2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface ArbitrageDashboardEmptyStateProps {
  type: 'no-currencies' | 'no-opportunities' | 'no-matches';
}

const ArbitrageDashboardEmptyState = ({ type }: ArbitrageDashboardEmptyStateProps) => {
  const content = {
    'no-currencies': {
      icon: Target,
      title: 'Need more currencies',
      description: 'Add at least 3 currencies and configure their conversion rates to find arbitrage opportunities'
    },
    'no-opportunities': {
      icon: Target,
      title: 'No opportunities found',
      description: 'Configure conversion rates between your currencies to find arbitrage opportunities'
    },
    'no-matches': {
      icon: Search,
      title: 'No matching opportunities',
      description: 'Try adjusting your search or filter criteria'
    }
  };

  const { icon: Icon, title, description } = content[type];

  return (
    <div className="container mx-auto p-6">
      <Card className="p-12 text-center">
        <CardContent>
          <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

interface ArbitrageDashboardOpportunityCardProps {
  opportunity: ArbitrageOpportunity;
  currencies: Currency[];
  rates: ConversionRate[];
  getCurrencyName: (id: string) => string;
  getCurrency: (id: string) => Currency | undefined;
  getOriginalRate: (fromCurrencyId: string, toCurrencyId: string) => ConversionRate | undefined;
  getRiskLevel: (riskScore: number) => 'low' | 'medium' | 'high';
  getRiskColor: (riskLevel: 'low' | 'medium' | 'high') => string;
}

const ArbitrageDashboardOpportunityCard = ({
  opportunity,
  getCurrencyName,
  getCurrency,
  getOriginalRate,
  getRiskLevel,
  getRiskColor,
}: ArbitrageDashboardOpportunityCardProps) => {
  const riskLevel = getRiskLevel(opportunity.riskScore);
  const confidenceScore = getConfidenceScore(opportunity.riskScore);

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        opportunity.profitPercentage > 0 ? 'border-green-200' : 'border-red-200'
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {opportunity.profitPercentage > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={opportunity.profitPercentage > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(opportunity.profitPercentage, 2)}% Profit
            </span>
          </CardTitle>
          <Badge className={getRiskColor(riskLevel)}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trade Path */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">TRADE PATH</h4>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {opportunity.path.map((currencyId, index) => {
              const currency = getCurrency(currencyId);
              const quantity = opportunity.quantities[index];
              return (
                <React.Fragment key={`${currencyId}-${index}`}>
                  <Badge variant="secondary" className="font-mono flex items-center gap-1 px-2">
                    <IconDisplay iconName={currency?.icon || ''} className="h-10 w-10" />
                    <span>x{quantity}</span>
                  </Badge>
                  {index < opportunity.path.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Trading Steps */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">TRADING STEPS</h4>
          <div className="grid grid-cols-1 gap-2">
            {opportunity.rates.map((rate, index) => {
              const fromCurrency = getCurrency(opportunity.path[index]);
              const toCurrency = getCurrency(opportunity.path[index + 1]);
              const fromQuantity = opportunity.quantities[index];
              const toQuantity = opportunity.quantities[index + 1];

              const originalRate = getOriginalRate(opportunity.path[index], opportunity.path[index + 1]);
              const rateDisplay = originalRate
                ? `${originalRate.fromQuantity}:${originalRate.toQuantity}`
                : formatCurrency(rate, 4);

              return (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <IconDisplay iconName={fromCurrency?.icon || ''} className="h-8 w-8" />
                    <span className="font-mono font-semibold">{fromQuantity}</span>
                    <span>{getCurrencyName(opportunity.path[index])}</span>
                    <span>→</span>
                    <IconDisplay iconName={toCurrency?.icon || ''} className="h-8 w-8" />
                    <span className="font-mono font-semibold">{toQuantity}</span>
                    <span>{getCurrencyName(opportunity.path[index + 1])}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rateDisplay}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gold Cost Information */}
        {opportunity.totalGoldCost !== undefined && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">GOLD COST</h4>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Gold Required:</span>
                <span className="font-mono font-semibold text-amber-700">
                  {formatCurrency(opportunity.totalGoldCost, 0)} gold
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Risk and Confidence */}
        <div className={`flex flex-wrap gap-x-10 gap-y-2 pt-2 px-10 justify-between border-t`}>
          <div className="text-center m-auto">
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <p className="text-lg font-semibold">{formatCurrency(opportunity.riskScore, 1)}/10</p>
          </div>
          <div className="text-center m-auto">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-lg font-semibold text-primary">{confidenceScore.toFixed(2)}%</p>
          </div>
          {opportunity.totalGoldCost !== undefined && (
            <div className="text-center m-auto">
              <p className="text-sm text-muted-foreground">Gold Cost</p>
              <p className="text-lg font-semibold text-primary">{formatCurrency(opportunity.totalGoldCost, 0)} gold</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ArbitrageDashboard = ({
  currencies,
  opportunities,
  rates,
  onPrecisionChange,
}: ArbitrageDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'profit' | 'risk' | 'confidence'>('profit');
  const [filterByRisk, setFilterByRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterByBaseCurrency, setFilterByBaseCurrency] = useState<string>('all');
  const [precision, setPrecision] = useState(1000);

  const getCurrencyName = useCallback((id: string) =>
    currencies.find(c => c.id === id)?.name || 'Unknown', [currencies]);

  const getCurrency = (id: string) => currencies.find(c => c.id === id);

  const getOriginalRate = useCallback((fromCurrencyId: string, toCurrencyId: string) => {
    return rates.find(rate =>
      rate.fromCurrencyId === fromCurrencyId && rate.toCurrencyId === toCurrencyId
    );
  }, [rates]);

  const getRiskLevel = (riskScore: number): 'low' | 'medium' | 'high' => {
    if (riskScore <= 3) return 'low';
    if (riskScore <= 6) return 'medium';
    return 'high';
  };

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const filteredAndSortedOpportunities = useMemo(() => {
    const filtered = opportunities.filter(opp => {
      const searchMatch = searchTerm === '' ||
        opp.path.some(currencyId =>
          getCurrencyName(currencyId).toLowerCase().includes(searchTerm.toLowerCase())
        );

      const riskLevel = getRiskLevel(opp.riskScore);
      const riskMatch = filterByRisk === 'all' || riskLevel === filterByRisk;

      // Filter by starting base currency (first currency in the path)
      const baseCurrencyMatch = filterByBaseCurrency === 'all' ||
        (opp.path.length > 0 && opp.path[0] === filterByBaseCurrency);

      // Filter out opportunities with zero quantities (impossible to execute)
      const hasValidQuantities = opp.quantities && opp.quantities.every(qty => qty > 0);

      return searchMatch && riskMatch && baseCurrencyMatch && hasValidQuantities;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return b.profitPercentage - a.profitPercentage;
        case 'risk':
          return a.riskScore - b.riskScore;
        case 'confidence':
          return getConfidenceScore(a.riskScore) - getConfidenceScore(b.riskScore);
        default:
          return 0;
      }
    });

    return filtered;
  }, [opportunities, searchTerm, filterByRisk, filterByBaseCurrency, getCurrencyName, sortBy]);

  const stats = useMemo(() => {
    const profitable = opportunities.filter(opp => opp.profitPercentage > 0).length;
    const avgProfit = opportunities.length > 0 
      ? opportunities.reduce((sum, opp) => sum + opp.profitPercentage, 0) / opportunities.length
      : 0;
    const bestOpportunity = opportunities.length > 0 
      ? Math.max(...opportunities.map(opp => opp.profitPercentage))
      : 0;
    
    return { profitable, avgProfit, bestOpportunity };
  }, [opportunities]);

  if (currencies.length < 3) {
    return <ArbitrageDashboardEmptyState type="no-currencies" />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ArbitrageDashboardHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        precision={precision}
        onPrecisionChange={(newPrecision) => {
          setPrecision(newPrecision);
          onPrecisionChange?.(newPrecision);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterByRisk={filterByRisk}
        onRiskFilterChange={setFilterByRisk}
        currencies={currencies}
        filterByBaseCurrency={filterByBaseCurrency}
        onBaseCurrencyFilterChange={setFilterByBaseCurrency}
      />

      <ArbitrageDashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedOpportunities.map((opportunity) => (
          <ArbitrageDashboardOpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            currencies={currencies}
            rates={rates}
            getCurrencyName={getCurrencyName}
            getCurrency={getCurrency}
            getOriginalRate={getOriginalRate}
            getRiskLevel={getRiskLevel}
            getRiskColor={getRiskColor}
          />
        ))}
      </div>

      {filteredAndSortedOpportunities.length === 0 && opportunities.length > 0 && (
        <ArbitrageDashboardEmptyState type="no-matches" />
      )}

      {opportunities.length === 0 && (
        <ArbitrageDashboardEmptyState type="no-opportunities" />
      )}
    </div>
  );
};
