import { Grid, Typography, Stack, Box, Autocomplete, TextField } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModelsByBrand } from '../../api/catalog'
import { getPriceSummary, getSalesTrend, getTopBrandsRevenue, getTopBrandsUnits } from '../../api/analytics'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import { KpiCardSkeleton, ChartSkeleton } from '../../components/common/Skeletons'
import LineTrend from '../../components/charts/LineTrend'
import BarTop from '../../components/charts/BarTop'
import KpiCard from '../../components/common/KpiCard'
import { Dayjs } from 'dayjs'

export default function PricePage() {
  const brandsQ = useQuery({ queryKey: ['brands'], queryFn: () => getBrands() })
  const [brand, setBrand] = useState<string>('')
  const modelsQ = useQuery({ queryKey: ['models', brand], queryFn: () => getModelsByBrand(brand), enabled: !!brand })
  const [model, setModel] = useState<string>('')
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const params = { start: toParam(start), end: toParam(end), brand: brand || undefined, model: model || undefined }
  const priceQ = useQuery({ queryKey: ['price-summary', params], queryFn: () => getPriceSummary(params) })
  // Price trend (avg price per month across brands)
  const trendQ = useQuery({ queryKey: ['price-trend', params], queryFn: () => getSalesTrend({ start: params.start, end: params.end }) })
  // Brand average price top: merge revenue and units
  const topRevQ = useQuery({ queryKey: ['brand-top-rev', params], queryFn: () => getTopBrandsRevenue({ start: params.start, end: params.end, limit: 10 }) })
  const topUnitsQ = useQuery({ queryKey: ['brand-top-units-for-price', params], queryFn: () => getTopBrandsUnits({ start: params.start, end: params.end, limit: 10 }) })

  // brand/model set via Autocomplete

  return (
    <Stack spacing={3}>
      <PageHeader title="价格统计" actions={<DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />} />
      <SectionCard
        title="统计概览"
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Autocomplete
              size="small"
              options={(brandsQ.data ?? []).map((b) => b.name)}
              value={brand}
              onChange={(_e, v) => { setBrand(v ?? ''); setModel(''); }}
              clearOnEscape
              renderInput={(params) => <TextField {...params} label="品牌" placeholder="全部品牌" />}
            />
            <Autocomplete
              size="small"
              options={(modelsQ.data ?? []).map((m) => m.name)}
              value={model}
              onChange={(_e, v) => setModel(v ?? '')}
              clearOnEscape
              renderInput={(params) => <TextField {...params} label="车型" placeholder="全部车型" />}
              disabled={!brand}
            />
          </Box>
        }
      >
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="最小值" value={priceQ.data?.min?.toFixed(0) ?? '-'} />}</Grid>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="均值" value={priceQ.data?.avg?.toFixed(0) ?? '-'} />}</Grid>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="中位数" value={priceQ.data?.median?.toFixed(0) ?? '-'} />}</Grid>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="P95" value={priceQ.data?.p95?.toFixed(0) ?? '-'} subtitle={`样本 ${priceQ.data?.samples ?? 0}`} />}</Grid>
        </Grid>
      </SectionCard>
      <SectionCard title="平均价格趋势">
        {trendQ.isLoading ? (
          <ChartSkeleton />
        ) : (
          (() => {
            const months = Array.from(new Set((trendQ.data ?? []).map((d) => d.month))).sort()
            const avg = months.map((m) => {
              const items = (trendQ.data ?? []).filter((d) => d.month === m)
              const rev = items.reduce((a, c) => a + c.revenue, 0)
              const units = items.reduce((a, c) => a + c.units, 0)
              return units ? rev / units : 0
            })
            return <LineTrend x={months} series={[{ name: '均价', data: avg }]} />
          })()
        )}
      </SectionCard>
      <SectionCard title="品牌均价 Top">
        {topRevQ.isLoading || topUnitsQ.isLoading ? (
          <ChartSkeleton />
        ) : (
          (() => {
            const uMap = new Map<string, number>((topUnitsQ.data ?? []).map((x) => [x.brandName, x.units]))
            const items = (topRevQ.data ?? [])
              .map((r) => ({ name: r.brandName, value: uMap.get(r.brandName) ? r.revenue / (uMap.get(r.brandName) || 1) : 0 }))
              .filter((i) => i.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 10)
            return <BarTop items={items} valueFormatter={(v) => `${Math.round(v)} 元`} />
          })()
        )}
      </SectionCard>
    </Stack>
  )
}


