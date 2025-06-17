
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface RiskFilterSelectProps {
  filterByRisk: 'all' | 'low' | 'medium' | 'high';
  onRiskFilterChange: (value: 'all' | 'low' | 'medium' | 'high') => void;
}

export const RiskFilterSelect = ({ filterByRisk, onRiskFilterChange }: RiskFilterSelectProps) => (
  <Select value={filterByRisk} onValueChange={onRiskFilterChange}>
    <SelectTrigger className="w-32">
      <Filter className="h-4 w-4 mr-2" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Risk</SelectItem>
      <SelectItem value="low">Low Risk</SelectItem>
      <SelectItem value="medium">Medium Risk</SelectItem>
      <SelectItem value="high">High Risk</SelectItem>
    </SelectContent>
  </Select>
);
