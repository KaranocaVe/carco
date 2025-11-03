import { Grid, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import { getSalesTrend, getTopBrandsRevenue, getTopBrandsUnits } from '../../api/analytics'
import LineTrend from '../../components/charts/LineTrend'
import BarTop from '../../components/charts/BarTop'
import { Dayjs } from 'dayjs'

export default function BrandsPage() {
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const [metric, setMetric] = useState<'units' | 'revenue'>('units')
  const params = { start: toParam(start), end: toParam(end) }

  const trendQ = useQuery({ queryKey: ['brand-trend', params], queryFn: () => getSalesTrend(params) })
  const topRevenueQ = useQuery({ queryKey: ['brand-top-revenue', params], queryFn: () => getTopBrandsRevenue({ ...params, limit: 10 }) })
  const topUnitsQ = useQuery({ queryKey: ['brand-top-units', params], queryFn: () => getTopBrandsUnits({ ...params, limit: 10 }) })

  const months = Array.from(new Set((trendQ.data ?? []).map((d) => d.month))).sort()
  const brands = Array.from(new Set((trendQ.data ?? []).map((d) => d.brandName)))
  const series = brands.map((b) => ({ name: b, data: months.map((m) => {
    const item = (trendQ.data ?? []).find((d) => d.brandName === b && d.month === m)
    return metric === 'units' ? (item?.units ?? 0) : (item?.revenue ?? 0)
  }) }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">品牌分析</Typography>
        <div className="flex items-center gap-3">
          <ToggleButtonGroup size="small" value={metric} exclusive onChange={(_e, v) => v && setMetric(v)}>
            <ToggleButton value="units">销量</ToggleButton>
            <ToggleButton value="revenue">金额</ToggleButton>
          </ToggleButtonGroup>
          <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
        </div>
      </div>
      <LineTrend x={months} series={series} />
      <Grid container spacing={2}>
        {metric === 'units' ? (
          <>
            <Grid size={{ xs: 12, lg: 6 }}>
              <BarTop title="销量Top品牌" items={(topUnitsQ.data ?? []).map((x) => ({ name: x.brandName, value: x.units }))} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <BarTop title="金额Top品牌" items={(topRevenueQ.data ?? []).map((x) => ({ name: x.brandName, value: x.revenue }))} />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 6 }}>
              <BarTop title="金额Top品牌" items={(topRevenueQ.data ?? []).map((x) => ({ name: x.brandName, value: x.revenue }))} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <BarTop title="销量Top品牌" items={(topUnitsQ.data ?? []).map((x) => ({ name: x.brandName, value: x.units }))} />
            </Grid>
          </>
        )}
      </Grid>
    </div>
  )
}


