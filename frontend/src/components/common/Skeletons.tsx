import { Card, CardContent, Skeleton, Box } from '@mui/material';

export function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width={64} height={16} />
        <Skeleton variant="text" width={120} height={28} sx={{ mt: 1 }} />
        <Skeleton variant="text" width={96} height={16} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton({ height = 360 }: { height?: number }) {
  return <Box><Skeleton variant="rounded" height={height} /></Box>;
}


