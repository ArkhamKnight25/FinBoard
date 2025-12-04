import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardState, Widget } from '@/types';

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      theme: 'dark',

      addWidget: (widget: Widget) => {
        set((state) => ({
          widgets: [...state.widgets, widget],
        }));
      },

      removeWidget: (id: string) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      updateWidget: (id: string, updates: Partial<Widget>) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      updateWidgetPosition: (id: string, position: Widget['position']) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, position } : w
          ),
        }));
      },

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },

      exportConfig: () => {
        const state = get();
        return JSON.stringify({
          widgets: state.widgets,
          theme: state.theme,
        });
      },

      importConfig: (config: string) => {
        try {
          const parsed = JSON.parse(config);
          set({
            widgets: parsed.widgets || [],
            theme: parsed.theme || 'dark',
          });
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      },

      clearDashboard: () => {
        set({ widgets: [] });
      },
    }),
    {
      name: 'finboard-storage',
    }
  )
);
