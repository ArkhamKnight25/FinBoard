'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useWidgetData } from '@/hooks/useWidgetData';
import { UnifiedQuote } from '@/lib/finance/types';
import { TrendingUp } from 'lucide-react';

interface MarketGainersWidgetProps {
  onRemove?: () => void;
  onConfigure?: () => void;
}

export const MarketGainersWidget: React.FC<MarketGainersWidgetProps> = ({
  onRemove,
  onConfigure,
}) => {
  const { data: gainers, loading, error } = useWidgetData<UnifiedQuote[]>({
    provider: 'finnhub',
    endpoint: 'gainers',
    symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
    refreshIntervalMs: 120000, // 2 minutes
  });

  return (
    <Card
      title="Market Gainers"
      onRemove={onRemove}
      onConfigure={onConfigure}
      loading={loading}
      error={error || undefined}
    >
      <div className="space-y-3">
        {(gainers || []).map((stock, index) => (
          <div
            key={stock.symbol}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg hover:from-green-500/20 transition-all"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full text-green-400 font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{stock.symbol}</div>
              <div className="text-sm text-gray-400">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <TrendingUp className="w-3 h-3" />
                <span>+{stock.changePercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
