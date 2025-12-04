'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedQuote } from '@/lib/finance/types';
import { Search } from 'lucide-react';
import { useWidgetData } from '@/hooks/useWidgetData';

interface StockTableWidgetProps {
  symbols: string[];
  onRemove?: () => void;
  onConfigure?: () => void;
}

export const StockTableWidget: React.FC<StockTableWidgetProps> = ({
  symbols,
  onRemove,
  onConfigure,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card
      title="Stock Table"
      onRemove={onRemove}
      onConfigure={onConfigure}
      loading={loading}
      error={error || undefined}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">Symbol</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">Name</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-sm">Price</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-sm">Change</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium text-sm">Change %</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-white">{stock.symbol}</td>
                  <td className="py-3 px-3 text-gray-300 text-sm">{stock.name || '-'}</td>
                  <td className="py-3 px-3 text-right text-white">${stock.price.toFixed(2)}</td>
                  <td className={`py-3 px-3 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 text-right font-medium ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
