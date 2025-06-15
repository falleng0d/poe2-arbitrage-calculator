import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RotateCcw, Save, TrendingUp } from 'lucide-react';
import { ConversionRate, Currency } from '@/types';
import { toast } from '@/hooks/use-toast';

interface RateConfigurationProps {
  currencies: Currency[];
  rates: ConversionRate[];
  onUpdateRates: (rates: ConversionRate[]) => void;
}

interface RateInput {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: string;
  isValid: boolean;
}

export const RateConfiguration = ({
  currencies,
  rates,
  onUpdateRates,
}: RateConfigurationProps) => {
  const [rateInputs, setRateInputs] = useState<RateInput[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize rate inputs from existing rates
    const inputs: RateInput[] = [];
    
    currencies.forEach(fromCurrency => {
      currencies.forEach(toCurrency => {
        if (fromCurrency.id !== toCurrency.id) {
          const existingRate = rates.find(
            rate => rate.fromCurrencyId === fromCurrency.id && rate.toCurrencyId === toCurrency.id
          );
          
          inputs.push({
            fromCurrencyId: fromCurrency.id,
            toCurrencyId: toCurrency.id,
            rate: existingRate ? existingRate.rate.toString() : '',
            isValid: !!existingRate,
          });
        }
      });
    });
    
    setRateInputs(inputs);
    setHasChanges(false);
  }, [currencies, rates]);

  const handleRateChange = (fromCurrencyId: string, toCurrencyId: string, value: string) => {
    const numericValue = parseFloat(value);
    const isValid = !isNaN(numericValue) && numericValue > 0;
    
    setRateInputs(prev => 
      prev.map(input => 
        input.fromCurrencyId === fromCurrencyId && input.toCurrencyId === toCurrencyId
          ? { ...input, rate: value, isValid }
          : input
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    const validRates = rateInputs
      .filter(input => input.isValid && input.rate.trim() !== '')
      .map(input => ({
        fromCurrencyId: input.fromCurrencyId,
        toCurrencyId: input.toCurrencyId,
        rate: parseFloat(input.rate),
        lastUpdated: new Date(),
      }));

    onUpdateRates(validRates);
    setHasChanges(false);
    toast({
      title: 'Success',
      description: `Updated ${validRates.length} conversion rates`,
    });
  };

  const handleReset = () => {
    const inputs: RateInput[] = [];
    
    currencies.forEach(fromCurrency => {
      currencies.forEach(toCurrency => {
        if (fromCurrency.id !== toCurrency.id) {
          const existingRate = rates.find(
            rate => rate.fromCurrencyId === fromCurrency.id && rate.toCurrencyId === toCurrency.id
          );
          
          inputs.push({
            fromCurrencyId: fromCurrency.id,
            toCurrencyId: toCurrency.id,
            rate: existingRate ? existingRate.rate.toString() : '',
            isValid: !!existingRate,
          });
        }
      });
    });
    
    setRateInputs(inputs);
    setHasChanges(false);
  };

  const getCurrencyName = (id: string) => {
    return currencies.find(c => c.id === id)?.name || 'Unknown';
  };

  const getOutlierRates = () => {
    const validRates = rateInputs.filter(input => input.isValid && input.rate.trim() !== '');
    if (validRates.length === 0) return [];
    
    const rates = validRates.map(input => parseFloat(input.rate));
    const avg = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const stdDev = Math.sqrt(rates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / rates.length);
    
    return validRates.filter(input => {
      const rate = parseFloat(input.rate);
      return Math.abs(rate - avg) > stdDev * 2; // Rates more than 2 standard deviations from mean
    });
  };

  const outlierRates = getOutlierRates();

  if (currencies.length < 2) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <CardContent>
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Need more currencies</h3>
            <p className="text-muted-foreground">
              Add at least 2 currencies to configure conversion rates
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Rate Configuration</h2>
        <div className="flex space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {outlierRates.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Potential Outlier Rates Detected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-2">
              The following rates are significantly different from the average. Please verify:
            </p>
            <div className="flex flex-wrap gap-2">
              {outlierRates.map(rate => (
                <Badge key={`${rate.fromCurrencyId}-${rate.toCurrencyId}`} variant="secondary">
                  {getCurrencyName(rate.fromCurrencyId)} → {getCurrencyName(rate.toCurrencyId)}: {rate.rate}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {currencies.map(fromCurrency => (
          <Card key={fromCurrency.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>From {fromCurrency.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies
                  .filter(toCurrency => toCurrency.id !== fromCurrency.id)
                  .map(toCurrency => {
                    const rateInput = rateInputs.find(
                      input => input.fromCurrencyId === fromCurrency.id && input.toCurrencyId === toCurrency.id
                    );
                    
                    return (
                      <div key={toCurrency.id} className="space-y-2">
                        <Label htmlFor={`${fromCurrency.id}-${toCurrency.id}`}>
                          To {toCurrency.name}
                        </Label>
                        <Input
                          id={`${fromCurrency.id}-${toCurrency.id}`}
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0.0000"
                          value={rateInput?.rate || ''}
                          onChange={(e) => handleRateChange(fromCurrency.id, toCurrency.id, e.target.value)}
                          className={
                            rateInput?.rate && !rateInput.isValid
                              ? 'border-destructive focus:border-destructive'
                              : ''
                          }
                        />
                        {rateInput?.rate && !rateInput.isValid && (
                          <p className="text-sm text-destructive">
                            Please enter a valid positive number
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {rateInputs.filter(input => input.isValid && input.rate.trim() !== '').length}
              </p>
              <p className="text-sm text-muted-foreground">Valid Rates</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">
                {currencies.length * (currencies.length - 1)}
              </p>
              <p className="text-sm text-muted-foreground">Total Possible Rates</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {outlierRates.length}
              </p>
              <p className="text-sm text-muted-foreground">Potential Outliers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
