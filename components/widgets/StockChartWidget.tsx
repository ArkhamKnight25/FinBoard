'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useWidgetData } from '@/hooks/useWidgetData';
import { UnifiedTimeSeries } from '@/lib/finance/types';
import { ChartInterval } from '@/types';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface StockChartWidgetProps {
  symbol: string;
  interval?: ChartInterval;
  onRemove?: () => void;
  onConfigure?: () => void;
}

export const StockChartWidget: React.FC<StockChartWidgetProps> = ({
  symbol,
  interval = 'daily',
  onRemove,
  onConfigure,
}) => {
  const { data, loading, error } = useWidgetData<UnifiedTimeSeries>({
    provider: 'finnhub',
    endpoint: 'timeSeries',
    symbol,
    interval: interval === 'daily' ? '1D' : interval === 'weekly' ? '1W' : '1M',
    refreshIntervalMs: 300000, // 5 minutes
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">{payload[0].payload.date}</p>
          <p className="text-white font-semibold">Close: ${payload[0].value.toFixed(2)}</p>
          {payload[0].payload.high && (
            <>
              <p className="text-green-400 text-sm">High: ${payload[0].payload.high.toFixed(2)}</p>
              <p className="text-red-400 text-sm">Low: ${payload[0].payload.low.toFixed(2)}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const chartData = data?.points || [];

  return (
    <Card
      title={`${symbol} - ${interval.charAt(0).toUpperCase() + interval.slice(1)} Chart`}
      onRemove={onRemove}
      onConfigure={onConfigure}
      loading={loading}
      error={error || undefined}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-center py-8">No chart data available</p>
      )}
    </Card>
  );
};
