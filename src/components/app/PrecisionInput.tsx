
import { Input } from '@/components/ui/input';

interface PrecisionInputProps {
  precision: number;
  onPrecisionChange: (precision: number) => void;
}

export const PrecisionInput = ({ precision, onPrecisionChange }: PrecisionInputProps) => (
  <div className="flex items-center space-x-2">
    <label htmlFor="precision" className="text-sm font-medium text-muted-foreground">
      Precision:
    </label>
    <Input
      id="precision"
      type="number"
      value={precision}
      onChange={(e) => {
        const newPrecision = parseInt(e.target.value) || 1000;
        onPrecisionChange(newPrecision);
      }}
      className="w-20"
      min="1"
      max="100000"
      step="1"
    />
  </div>
);
