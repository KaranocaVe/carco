import { Grid, TextField, Typography, Stack } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useQuery } from '@tanstack/react-query'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'
import { getYoY, getSalesTrend } from '../../api/analytics'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import { KpiCardSkeleton, ChartSkeleton } from '../../components/common/Skeletons'
import LineTrend from '../../components/charts/LineTrend'

export default function YoYPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'))
  const q = useQuery({ queryKey: ['yoy', month.format('YYYY-MM')], queryFn: () => getYoY({ month: month.format('YYYY-MM-01') }) })

  const d = q.data
  const pmUnits = d ? ((d.units - d.prevMonthUnits) / Math.max(1, d.prevMonthUnits)) * 100 : 0
  const pyUnits = d ? ((d.units - d.prevYearUnits) / Math.max(1, d.prevYearUnits)) * 100 : 0
  const pmRev = d ? ((d.revenue - d.prevMonthRevenue) / Math.max(1, d.prevMonthRevenue)) * 100 : 0
  const pyRev = d ? ((d.revenue - d.prevYearRevenue) / Math.max(1, d.prevYearRevenue)) * 100 : 0
  const avgPrice = d && d.units ? d.revenue / d.units : 0
  const avgPricePm = d && d.prevMonthUnits ? d.prevMonthRevenue / d.prevMonthUnits : 0
  const avgPricePy = d && d.prevYearUnits ? d.prevYearRevenue / d.prevYearUnits : 0
  const pmAvg = avgPricePm ? ((avgPrice - avgPricePm) / avgPricePm) * 100 : 0
  const pyAvg = avgPricePy ? ((avgPrice - avgPricePy) / avgPricePy) * 100 : 0

  const start12 = month.subtract(11, 'month').startOf('month')
  const end12 = month.endOf('month')
  const trendQ = useQuery({
    queryKey: ['avg-price-12', start12.format('YYYY-MM-01'), end12.format('YYYY-MM-01')],
    queryFn: () => getSalesTrend({ start: start12.format('YYYY-MM-01'), end: end12.format('YYYY-MM-01') }),
  })

  return (
    <Stack spacing={3}>
      <PageHeader
        title="同比环比"
        actions={
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker enableAccessibleFieldDOMStructure={false} label="月份" views={["year", "month"]} value={month} onChange={(v) => v && setMonth(v.startOf('month'))} slots={{ textField: TextField }} />
          </LocalizationProvider>
        }
      />
      <SectionCard title="指标概览">
        {q.isLoading ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCardSkeleton /></Grid>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCardSkeleton /></Grid>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCardSkeleton /></Grid>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCardSkeleton /></Grid>
          </Grid>
        ) : (d && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="当月销量" value={d.units} subtitle={`环比 ${pmUnits.toFixed(1)}% ・ 同比 ${pyUnits.toFixed(1)}%`} /></Grid>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="当月金额" value={Math.round(d.revenue)} subtitle={`环比 ${pmRev.toFixed(1)}% ・ 同比 ${pyRev.toFixed(1)}%`} /></Grid>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="当月均价" value={Math.round(avgPrice)} subtitle={`环比 ${pmAvg.toFixed(1)}% ・ 同比 ${pyAvg.toFixed(1)}%`} /></Grid>
            <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="上月销量" value={d.prevMonthUnits} /></Grid>
          </Grid>
        ))}
      </SectionCard>
      <SectionCard title="均价（近12个月）">
        {trendQ.isLoading ? <ChartSkeleton /> : (() => {
          const months = Array.from(new Set((trendQ.data ?? []).map((dd) => dd.month))).sort()
          const avg = months.map((m) => {
            const items = (trendQ.data ?? []).filter((dd) => dd.month === m)
            const rev = items.reduce((a, c) => a + c.revenue, 0)
            const units = items.reduce((a, c) => a + c.units, 0)
            return units ? rev / units : 0
          })
          return <LineTrend x={months} series={[{ name: '均价', data: avg }]} />
        })()}
      </SectionCard>
    </Stack>
  )
}


