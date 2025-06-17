
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { Currency } from '@/types';
import { IconDisplay } from '@/components/app/IconDisplay';

interface BaseCurrencyFilterSelectProps {
  currencies: Currency[];
  filterByBaseCurrency: string;
  onBaseCurrencyFilterChange: (value: string) => void;
}

export const BaseCurrencyFilterSelect = ({ 
  currencies, 
  filterByBaseCurrency, 
  onBaseCurrencyFilterChange 
}: BaseCurrencyFilterSelectProps) => {
  return (
    <Select value={filterByBaseCurrency} onValueChange={onBaseCurrencyFilterChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>All Currencies</span>
          </div>
        </SelectItem>
        {currencies.map((currency) => (
          <SelectItem key={currency.id} value={currency.id}>
            <div className="flex items-center space-x-2">
              <IconDisplay iconName={currency.icon} className="h-4 w-4" />
              <span>{currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
