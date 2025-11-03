import { Box, Stack, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  const theme = useTheme();
  return (
    <Box sx={{
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      px: 2,
      py: 1.5,
      backgroundColor: theme.palette.background.paper,
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
}


