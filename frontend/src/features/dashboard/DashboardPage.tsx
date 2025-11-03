import { Grid, Typography, ToggleButtonGroup, ToggleButton, FormControlLabel, Switch, Stack } from '@mui/material'
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
import PageHeader from '../../components/layout/PageHeader'
import { ChartSkeleton, KpiCardSkeleton } from '../../components/common/Skeletons'
import SectionCard from '../../components/layout/SectionCard'

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

  const loadingTop = metric === 'units' ? topUnitsQ.isLoading || topRevenueQ.isLoading : topRevenueQ.isLoading || topUnitsQ.isLoading
  const loadingColors = colorsQ.isLoading
  const loadingPrice = priceQ.isLoading
  const loadingTrend = trendQ.isLoading

  // Aggregate totals by month for sparkline KPIs
  const totalsByMonthUnits = months.map((m) => (trendQ.data ?? [])
    .filter((d) => d.month === m)
    .reduce((acc, cur) => acc + (cur.units ?? 0), 0))
  const totalsByMonthRevenue = months.map((m) => (trendQ.data ?? [])
    .filter((d) => d.month === m)
    .reduce((acc, cur) => acc + (cur.revenue ?? 0), 0))
  const lastUnits = totalsByMonthUnits.length ? totalsByMonthUnits[totalsByMonthUnits.length - 1] : 0
  const prevUnits = totalsByMonthUnits.length > 1 ? totalsByMonthUnits[totalsByMonthUnits.length - 2] : 0
  const deltaUnits = prevUnits ? ((lastUnits - prevUnits) / prevUnits) * 100 : 0
  const lastRevenue = totalsByMonthRevenue.length ? totalsByMonthRevenue[totalsByMonthRevenue.length - 1] : 0
  const prevRevenue = totalsByMonthRevenue.length > 1 ? totalsByMonthRevenue[totalsByMonthRevenue.length - 2] : 0
  const deltaRevenue = prevRevenue ? ((lastRevenue - prevRevenue) / prevRevenue) * 100 : 0

  return (
    <Stack spacing={3}>
      <PageHeader title="仪表盘" actions={<DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          {loadingPrice ? <KpiCardSkeleton /> : <KpiCard title="价格均值" value={priceQ.data?.avg?.toFixed(0) ?? '-'} subtitle="单位：元" />}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {loadingPrice ? <KpiCardSkeleton /> : <KpiCard title="价格中位数" value={priceQ.data?.median?.toFixed(0) ?? '-'} subtitle={`样本 ${priceQ.data?.samples ?? 0}`} />}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {loadingPrice ? <KpiCardSkeleton /> : <KpiCard title="价格P95" value={priceQ.data?.p95?.toFixed(0) ?? '-'} />}
        </Grid>
      </Grid>

      <SectionCard
        title="销售趋势"
        actions={
          <>
            <ToggleButtonGroup size="small" value={metric} exclusive onChange={(_e, v) => v && setMetric(v)}>
              <ToggleButton value="units">销量</ToggleButton>
              <ToggleButton value="revenue">金额</ToggleButton>
            </ToggleButtonGroup>
            <FormControlLabel control={<Switch checked={segment} onChange={(e) => setSegment(e.target.checked)} />} label="按性别分段" />
          </>
        }
      >
        {loadingTrend ? (<ChartSkeleton />) : (!segment ? (<LineTrend x={months} series={series} />) : (<StackedBar x={months} series={genderSeries} />))}
      </SectionCard>

      <SectionCard title="关键指标">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <KpiCard title="总销量（当月）" value={lastUnits} subtitle="单位：台" trend={totalsByMonthUnits} delta={deltaUnits} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <KpiCard title="总金额（当月）" value={Math.round(lastRevenue)} subtitle="单位：元" trend={totalsByMonthRevenue} delta={deltaRevenue} />
          </Grid>
        </Grid>
      </SectionCard>

      <Grid container spacing={2}>
        {metric === 'units' ? (
          <>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SectionCard title="销量 Top 品牌">
                {loadingTop ? <ChartSkeleton /> : <BarTop items={(topUnitsQ.data ?? []).map((x) => ({ name: x.brandName, value: x.units }))} valueFormatter={(v) => `${v} 台`} />}
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SectionCard title="金额 Top 品牌">
                {loadingTop ? <ChartSkeleton /> : <BarTop items={(topRevenueQ.data ?? []).map((x) => ({ name: x.brandName, value: x.revenue }))} valueFormatter={(v) => `${Math.round(v)} 元`} />}
              </SectionCard>
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SectionCard title="金额 Top 品牌">
                {loadingTop ? <ChartSkeleton /> : <BarTop items={(topRevenueQ.data ?? []).map((x) => ({ name: x.brandName, value: x.revenue }))} valueFormatter={(v) => `${Math.round(v)} 元`} />}
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SectionCard title="销量 Top 品牌">
                {loadingTop ? <ChartSkeleton /> : <BarTop items={(topUnitsQ.data ?? []).map((x) => ({ name: x.brandName, value: x.units }))} valueFormatter={(v) => `${v} 台`} />}
              </SectionCard>
            </Grid>
          </>
        )}
      </Grid>

      <SectionCard title="颜色占比">
        {loadingColors ? <ChartSkeleton /> : <PieDonut data={(colorsQ.data ?? []).map((c) => ({ name: c.colorName, value: c.units }))} />}
      </SectionCard>
    </Stack>
  )
}


