import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export const buildChartBase = (theme: Theme) => ({
  textStyle: {
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
  },
  color: [
    // Softer Cupertino palette
    '#0A84FF', // Blue
    '#5E5CE6', // Indigo
    '#FF9F0A', // Orange
    '#34C759', // Green
    '#FF3B30', // Red
    '#64D2FF', // Teal
    '#AF52DE', // Purple
    '#FF2D55', // Pink
  ],
  grid: { left: 28, right: 20, top: 28, bottom: 24, containLabel: true },
  tooltip: {
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(20,20,22,0.9)',
    textStyle: { color: theme.palette.text.primary },
    extraCssText: 'backdrop-filter:saturate(180%) blur(8px); border-radius:10px;'
  },
});

export const useMuiTheme = () => useTheme<Theme>();


