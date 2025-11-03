import { Grid, Typography, ToggleButtonGroup, ToggleButton, Stack } from '@mui/material'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import { ChartSkeleton } from '../../components/common/Skeletons'
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

  const loadingTrend = trendQ.isLoading
  const loadingTop = topRevenueQ.isLoading || topUnitsQ.isLoading
  return (
    <Stack spacing={3}>
      <PageHeader
        title="品牌分析"
        actions={<DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />}
      />
      <SectionCard
        title="品牌销售趋势"
        actions={
          <ToggleButtonGroup size="small" value={metric} exclusive onChange={(_e, v) => v && setMetric(v)}>
            <ToggleButton value="units">销量</ToggleButton>
            <ToggleButton value="revenue">金额</ToggleButton>
          </ToggleButtonGroup>
        }
      >
        {loadingTrend ? <ChartSkeleton /> : <LineTrend x={months} series={series} />}
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
    </Stack>
  )
}


