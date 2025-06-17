import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, TrendingUp } from 'lucide-react';
import { ConversionRate, Currency } from '@/types';
import { toast } from '@/hooks/use-toast';
import { IconDisplay } from '@/components/app/IconDisplay';
import { MultiSelectCombobox, MultiSelectOption } from '@/components/ui/multi-select-combobox';

interface RateConfigurationProps {
  currencies: Currency[];
  rates: ConversionRate[];
  onUpdateRates: (rates: ConversionRate[]) => void;
}

interface RateInput {
  fromCurrencyId: string;
  toCurrencyId: string;
  fromQuantity: string;
  toQuantity: string;
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
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

  const currencyOptions: MultiSelectOption[] = currencies.map(currency => ({
    value: currency.id,
    label: currency.name,
    icon: <IconDisplay iconName={currency.icon} className="h-5 w-5" />,
  }));

  const filteredRateInputs = selectedCurrencies.length === 0
    ? rateInputs
    : rateInputs.filter(input =>
        selectedCurrencies.includes(input.fromCurrencyId) ||
        selectedCurrencies.includes(input.toCurrencyId)
      );

  const filteredCurrencies = selectedCurrencies.length === 0
    ? currencies
    : currencies.filter(currency => selectedCurrencies.includes(currency.id));

  useEffect(() => {
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
            fromQuantity: existingRate?.fromQuantity?.toString() || '',
            toQuantity: existingRate?.toQuantity?.toString() || '',
            rate: existingRate ? existingRate.rate.toString() : '',
            isValid: !!existingRate,
          });
        }
      });
    });
    setRateInputs(inputs);
    setHasChanges(false);
  }, [currencies, rates]);

  const handleQuantityChange = (
    fromCurrencyId: string,
    toCurrencyId: string,
    field: 'fromQuantity' | 'toQuantity',
    value: string
  ) => {
    setRateInputs(prev =>
      prev.map(input => {
        if (input.fromCurrencyId === fromCurrencyId && input.toCurrencyId === toCurrencyId) {
          const updatedInput = { ...input, [field]: value };

          const fromQty = parseFloat(field === 'fromQuantity' ? value : input.fromQuantity);
          const toQty = parseFloat(field === 'toQuantity' ? value : input.toQuantity);

          const isFromValid = !isNaN(fromQty) && fromQty > 0;
          const isToValid = !isNaN(toQty) && toQty > 0;
          const isValid = isFromValid && isToValid;

          const rate = isValid ? (toQty / fromQty).toString() : '';

          return {
            ...updatedInput,
            rate,
            isValid,
          };
        }
        return input;
      })
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    const validRates = rateInputs
      .filter(input => input.isValid && input.fromQuantity.trim() !== '' && input.toQuantity.trim() !== '')
      .map(input => ({
        fromCurrencyId: input.fromCurrencyId,
        toCurrencyId: input.toCurrencyId,
        fromQuantity: parseFloat(input.fromQuantity),
        toQuantity: parseFloat(input.toQuantity),
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
            fromQuantity: existingRate?.fromQuantity?.toString() || '',
            toQuantity: existingRate?.toQuantity?.toString() || '',
            rate: existingRate ? existingRate.rate.toString() : '',
            isValid: !!existingRate,
          });
        }
      });
    });

    setRateInputs(inputs);
    setHasChanges(false);
  };

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
          {/* Currency Filter */}
          <MultiSelectCombobox
            options={currencyOptions}
            selected={selectedCurrencies}
            onSelectionChange={setSelectedCurrencies}
            placeholder="Select currencies to filter..."
            searchPlaceholder="Search currencies..."
            emptyText="No currencies found."
            className="max-w-md"
          />
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

      <div className="grid gap-6">
        {filteredCurrencies.map(fromCurrency => (
          <Card key={fromCurrency.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-1 bg-primary/10 rounded-lg">
                  <IconDisplay iconName={fromCurrency.icon} className="h-8 w-8" />
                </div>
                <span>From {fromCurrency.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCurrencies
                  .filter(toCurrency => toCurrency.id !== fromCurrency.id)
                  .map(toCurrency => {
                    const rateInput = rateInputs.find(
                      input => input.fromCurrencyId === fromCurrency.id && input.toCurrencyId === toCurrency.id
                    );
                    
                    return (
                      <div key={toCurrency.id} className="space-y-3 p-4 border rounded-lg">
                        <Label className="flex items-center space-x-2 font-medium">
                          <IconDisplay iconName={toCurrency.icon} className="h-6 w-6" />
                          <span>To {toCurrency.name}</span>
                        </Label>

                        <div className="grid grid-cols-2 gap-3">

                          <div className="space-y-1">
                            <Label htmlFor={`${fromCurrency.id}-${toCurrency.id}-to`} className="text-sm text-muted-foreground">
                              To ({toCurrency.name})
                            </Label>
                            <Input
                              id={`${fromCurrency.id}-${toCurrency.id}-to`}
                              type="number"
                              step="any"
                              min="0"
                              value={rateInput?.toQuantity || ''}
                              onChange={(e) => handleQuantityChange(fromCurrency.id, toCurrency.id, 'toQuantity', e.target.value)}
                              className={
                                `${rateInput?.toQuantity && !rateInput.isValid
                                  ? 'border-destructive focus:border-destructive'
                                  : ''}`
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`${fromCurrency.id}-${toCurrency.id}-from`} className="text-sm text-muted-foreground">
                              From ({fromCurrency.name})
                            </Label>
                            <Input
                              id={`${fromCurrency.id}-${toCurrency.id}-from`}
                              type="number"
                              step="any"
                              min="0"
                              value={rateInput?.fromQuantity || ''}
                              onChange={(e) => handleQuantityChange(fromCurrency.id, toCurrency.id, 'fromQuantity', e.target.value)}
                              className={
                                `${rateInput?.fromQuantity && !rateInput.isValid
                                  ? 'border-destructive focus:border-destructive'
                                  : ''}`
                              }
                            />
                          </div>
                        </div>

                        {rateInput?.rate && rateInput.isValid && (
                          <div className="text-sm text-muted-foreground">
                            Rate: {parseFloat(rateInput.rate).toFixed(6)}
                          </div>
                        )}

                        {(rateInput?.fromQuantity || rateInput?.toQuantity) && !rateInput.isValid && (
                          <p className="text-sm text-destructive">
                            Please enter valid positive numbers for both quantities
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {filteredRateInputs.filter(input => input.isValid && input.fromQuantity.trim() !== '' && input.toQuantity.trim() !== '').length}
              </p>
              <p className="text-sm text-muted-foreground">Valid Rates {selectedCurrencies.length > 0 ? '(Filtered)' : ''}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {filteredCurrencies.length * (filteredCurrencies.length - 1)}
              </p>
              <p className="text-sm text-muted-foreground">Total Possible Rates {selectedCurrencies.length > 0 ? '(Filtered)' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
