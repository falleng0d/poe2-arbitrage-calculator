import { Button } from '@/components/ui/button';
import { Coins, Settings, TrendingUp } from 'lucide-react';

interface NavigationProps {
  activeTab: 'currencies' | 'rates' | 'opportunities';
  onTabChange: (tab: 'currencies' | 'rates' | 'opportunities') => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'currencies' as const, label: 'Currencies', icon: Coins },
    { id: 'rates' as const, label: 'Rates', icon: Settings },
    { id: 'opportunities' as const, label: 'Opportunities', icon: TrendingUp },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 w-full">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PoE2 Arbitrage Calculator</h1>
          </div>
          
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
