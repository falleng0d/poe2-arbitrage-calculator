import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins, Settings, TrendingUp } from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();

  const tabs = [
    { id: 'opportunities', path: '/', label: 'Opportunities', icon: TrendingUp },
    { id: 'rates', path: '/rates', label: 'Rates', icon: Settings },
    { id: 'currencies', path: '/currencies', label: 'Currencies', icon: Coins },
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
              const isActive = location.pathname === tab.path;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  asChild
                  className={`flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Link to={tab.path}>
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
