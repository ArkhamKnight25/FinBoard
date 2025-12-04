// Widget Types
export type WidgetType = 'table' | 'card' | 'chart' | 'watchlist' | 'gainers' | 'performance' | 'custom';

export type ChartInterval = 'daily' | 'weekly' | 'monthly';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: string;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface WidgetConfig {
  apiEndpoint?: string;
  refreshInterval?: number;
  symbols?: string[];
  chartInterval?: ChartInterval;
  displayFields?: string[];
  limit?: number;
  filters?: Record<string, any>;
  displayMode?: 'card' | 'table' | 'list';
}

export interface DashboardState {
  widgets: Widget[];
  theme: 'light' | 'dark';
  addWidget: (widget: Widget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateWidgetPosition: (id: string, position: Widget['position']) => void;
  toggleTheme: () => void;
  exportConfig: () => string;
  importConfig: (config: string) => void;
  clearDashboard: () => void;
}
