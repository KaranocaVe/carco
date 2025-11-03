import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: [
      'system-ui',
      'SF Pro Text',
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
  },
});


