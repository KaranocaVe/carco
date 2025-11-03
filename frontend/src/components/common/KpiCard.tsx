import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import Sparkline from '../charts/Sparkline';

export default function KpiCard({ title, value, subtitle, trend, delta, color }: { title: string; value: string | number; subtitle?: string; trend?: number[]; delta?: number; color?: string }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ position: 'relative', minHeight: 84, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>{value}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        {typeof delta === 'number' && (
          <Chip size="small" label={`${delta > 0 ? '▲' : delta < 0 ? '▼' : ''}${Math.abs(delta).toFixed(1)}%`} color={delta >= 0 ? 'success' : 'error'} sx={{ mt: 0.75 }} />
        )}
        {trend && trend.length > 1 && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, width: 96, height: 32 }}>
            <Sparkline data={trend} color={color} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}


