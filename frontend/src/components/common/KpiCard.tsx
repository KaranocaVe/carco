import { Card, CardContent, Typography } from '@mui/material';

export default function KpiCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="h5" className="mt-1">{value}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" className="mt-1">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}


