'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useWidgetData } from '@/hooks/useWidgetData';
import { UnifiedQuote } from '@/lib/finance/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistWidgetProps {
  symbols: string[];
  onRemove?: () => void;
  onConfigure?: () => void;
}

export const WatchlistWidget: React.FC<WatchlistWidgetProps> = ({
  symbols,
  onRemove,
  onConfigure,
}) => {
  // Fetch data for each symbol
  const results = symbols.map(symbol => 
    useWidgetData<UnifiedQuote>({
      provider: 'finnhub',
      endpoint: 'quote',
      symbol,
      refreshIntervalMs: 60000,
    })
  );

  const loading = results.some(r => r.loading);
  const error = results.find(r => r.error)?.error || null;
  const stocks = results.map(r => r.data).filter((d): d is UnifiedQuote => d !== null);

  return (
    <Card
      title="Watchlist"
      onRemove={onRemove}
      onConfigure={onConfigure}
      loading={loading}
      error={error || undefined}
    >
      <div className="space-y-3">
        {stocks.length === 0 && !loading ? (
          <p className="text-gray-400 text-center py-4">No stocks in watchlist</p>
        ) : (
          stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-white">{stock.symbol}</div>
                <div className="text-sm text-gray-400">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">${stock.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{stock.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
