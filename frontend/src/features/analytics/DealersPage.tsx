import { Grid, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import { getDealerLongestDwell, getTopDealersRevenue, getTopDealersUnits } from '../../api/analytics'
import BarTop from '../../components/charts/BarTop'
import KpiCard from '../../components/common/KpiCard'
import { Dayjs } from 'dayjs'

export default function DealersPage() {
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const params = { start: toParam(start), end: toParam(end) }

  const topRevenueQ = useQuery({ queryKey: ['dealer-top-revenue', params], queryFn: () => getTopDealersRevenue({ ...params, limit: 10 }) })
  const topUnitsQ = useQuery({ queryKey: ['dealer-top-units', params], queryFn: () => getTopDealersUnits({ ...params, limit: 10 }) })
  const dwellQ = useQuery({ queryKey: ['dealer-longest-dwell', params], queryFn: () => getDealerLongestDwell({ ...params }), retry: 0 })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">经销商分析</Typography>
        <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
      </div>

      {dwellQ.data && (
        <KpiCard title="平均库存时间最长的经销商" value={`${dwellQ.data.dealerName} ・ ${dwellQ.data.avgDays.toFixed(1)} 天`} subtitle={`样本 ${dwellQ.data.sampleSize}`} />
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarTop title="经销商金额Top" items={(topRevenueQ.data ?? []).map((x) => ({ name: x.dealerName, value: x.revenue }))} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarTop title="经销商销量Top" items={(topUnitsQ.data ?? []).map((x) => ({ name: x.dealerName, value: x.units }))} />
        </Grid>
      </Grid>
    </div>
  )}


