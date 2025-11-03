import { Grid, Typography, ToggleButtonGroup, ToggleButton, FormControlLabel, Switch } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Dayjs } from 'dayjs'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import { getPriceSummary, getSalesTrend, getTopBrandsRevenue, getTopBrandsUnits, getTopColors } from '../../api/analytics'
import KpiCard from '../../components/common/KpiCard'
import LineTrend from '../../components/charts/LineTrend'
import BarTop from '../../components/charts/BarTop'
import PieDonut from '../../components/charts/PieDonut'
import StackedBar from '../../components/charts/StackedBar'
import { useState } from 'react'

export default function DashboardPage() {
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const [metric, setMetric] = useState<'units' | 'revenue'>('units')
  const [segment, setSegment] = useState(false)

  const params = { start: toParam(start), end: toParam(end) }

  const trendQ = useQuery({ queryKey: ['trend', params, segment], queryFn: () => getSalesTrend({ ...params, segment }) })
  const topRevenueQ = useQuery({ queryKey: ['topRevenue', params], queryFn: () => getTopBrandsRevenue({ ...params, limit: 5 }) })
  const topUnitsQ = useQuery({ queryKey: ['topUnits', params], queryFn: () => getTopBrandsUnits({ ...params, limit: 5 }) })
  const colorsQ = useQuery({ queryKey: ['colors', params], queryFn: () => getTopColors({ ...params, limit: 8 }) })
  const priceQ = useQuery({ queryKey: ['price', params], queryFn: () => getPriceSummary(params) })

  // Shape trend series
  const months = Array.from(new Set((trendQ.data ?? []).map((d) => d.month))).sort()
  const brands = Array.from(new Set((trendQ.data ?? []).map((d) => d.brandName)))
  const series = brands.map((b) => ({ name: b, data: months.map((m) => {
    const item = (trendQ.data ?? []).find((d) => d.brandName === b && d.month === m)
    return metric === 'units' ? (item?.units ?? 0) : (item?.revenue ?? 0)
  }) }))

  // Segment by gender stacked bar (aggregated across brands per month)
  const genders = ['M', 'F']
  const genderSeries = genders.map((g) => ({ name: g === 'M' ? '男' : '女', data: months.map((m) => (trendQ.data ?? [])
    .filter((d) => d.month === m && d.gender === g)
    .reduce((acc, cur) => acc + (metric === 'units' ? cur.units : cur.revenue), 0)) }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">仪表盘</Typography>
        <div className="flex items-center gap-3">
          <ToggleButtonGroup size="small" value={metric} exclusive onChange={(_e, v) => v && setMetric(v)}>
            <ToggleButton value="units">销量</ToggleButton>
            <ToggleButton value="revenue">金额</ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel control={<Switch checked={segment} onChange={(e) => setSegment(e.target.checked)} />} label="按性别分段" />
          <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
        </div>
      </div>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {!segment ? (<LineTrend x={months} series={series} />) : (<StackedBar x={months} series={genderSeries} />)}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={2}>
            <Grid size={12}><KpiCard title="价格均值" value={priceQ.data?.avg?.toFixed(0) ?? '-'} subtitle="单位：元" /></Grid>
            <Grid size={12}><KpiCard title="价格中位数" value={priceQ.data?.median?.toFixed(0) ?? '-'} subtitle={`样本 ${priceQ.data?.samples ?? 0}`} /></Grid>
            <Grid size={12}><KpiCard title="价格P95" value={priceQ.data?.p95?.toFixed(0) ?? '-'} /></Grid>
          </Grid>
        </Grid>
      </Grid>

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

      <PieDonut title="颜色占比" data={(colorsQ.data ?? []).map((c) => ({ name: c.colorName, value: c.units }))} />
    </div>
  )
}


