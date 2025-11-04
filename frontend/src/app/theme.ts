import { alpha, createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: '#0A84FF' },
    success: { main: '#34C759' },
    warning: { main: '#FF9F0A' },
    error: { main: '#FF3B30' },
    info: { main: '#64D2FF' },
    background: {
      default: mode === 'light' ? '#F6F7F9' : '#0B0C0E',
      paper: mode === 'light' ? '#FFFFFF' : '#15171A',
    },
    divider: mode === 'light' ? alpha('#000', 0.08) : alpha('#fff', 0.12),
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      'SF Pro Display',
      'SF Pro Text',
      'system-ui',
      'Helvetica Neue',
      'Segoe UI',
      'Roboto',
      'PingFang SC',
      'Hiragino Sans GB',
      'Noto Sans CJK SC',
      'Microsoft YaHei',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontSize: 28, fontWeight: 600, letterSpacing: -0.2 },
    h5: { fontWeight: 600, letterSpacing: -0.1 },
    body1: { lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          // subtle background tint for Apple feel
          backgroundImage: mode === 'light'
            ? 'radial-gradient(1200px 600px at 0% 0%, rgba(10,132,255,0.04), transparent 60%), radial-gradient(1000px 500px at 100% 100%, rgba(88,86,214,0.04), transparent 60%)'
            : 'radial-gradient(1200px 600px at 0% 0%, rgba(10,132,255,0.06), transparent 60%), radial-gradient(1000px 500px at 100% 100%, rgba(88,86,214,0.06), transparent 60%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'saturate(180%) blur(16px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: 56 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'saturate(180%) blur(14px)',
          borderRight: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        }),
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: 0.2, opacity: 0.72 },
      },
    },
    // DataGrid visual polish（移除类型报错，可在组件处通过 sx 定制）
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          '&:focus-visible': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
        }),
      },
    },
    // Segmented control style
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 2,
          borderRadius: 9999,
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 'none',
          borderRadius: 9999,
          padding: '6px 12px',
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.18),
            color: theme.palette.primary.contrastText,
          },
          '&:not(.Mui-selected):hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        }),
      },
    },
    // iOS-like Switch
    MuiSwitch: {
      styleOverrides: {
        root: { width: 42, height: 26, padding: 0 },
        switchBase: ({ theme }) => ({
          padding: 0,
          margin: 2,
          transform: 'translateX(0px)',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.main,
              opacity: 1,
            },
          },
        }),
        thumb: { width: 22, height: 22 },
        track: ({ theme }) => ({
          borderRadius: 26 / 2,
          backgroundColor: theme.palette.mode === 'light' ? alpha('#000', 0.24) : alpha('#fff', 0.24),
          opacity: 1,
          boxSizing: 'border-box',
        }),
      },
    },
    // Softer input corners
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

