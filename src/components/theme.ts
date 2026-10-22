import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export const lightColors = {
  bg: '#f5f6fa',
  card: '#ffffff',
  text: '#1b1d24',
  muted: '#6b7280',
  primary: '#2563eb',
  income: '#16a34a',
  expense: '#dc2626',
  warn: '#f59e0b',
  border: '#e5e7eb',
};

export type Colors = typeof lightColors;

export const darkColors: Colors = {
  bg: '#0f1115',
  card: '#1a1d24',
  text: '#e8eaed',
  muted: '#9aa0aa',
  primary: '#5b8def',
  income: '#4ade80',
  expense: '#f87171',
  warn: '#fbbf24',
  border: '#2d323c',
};

export const useIsDark = () => useColorScheme() === 'dark';

export const useColors = (): Colors => (useIsDark() ? darkColors : lightColors);

/** Crea estilos a partir de la paleta activa. `factory` debe ser una función estable (nivel módulo). */
export function useThemedStyles<T>(factory: (c: Colors) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [factory, colors]);
}
