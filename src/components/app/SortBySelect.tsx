
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortBySelectProps {
  sortBy: 'profit' | 'risk' | 'confidence';
  onSortChange: (value: 'profit' | 'risk' | 'confidence') => void;
}

export const SortBySelect = ({ sortBy, onSortChange }: SortBySelectProps) => (
  <Select value={sortBy} onValueChange={onSortChange}>
    <SelectTrigger className="w-32">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="profit">Profit</SelectItem>
      <SelectItem value="risk">Risk</SelectItem>
      <SelectItem value="confidence">Confidence</SelectItem>
    </SelectContent>
  </Select>
);
