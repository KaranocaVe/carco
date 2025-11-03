import { Grid, MenuItem, Select, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModelsByBrand } from '../../api/catalog'
import { getPriceSummary } from '../../api/analytics'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
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

  const onBrand = (e: SelectChangeEvent) => { setBrand(e.target.value); setModel('') }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">价格统计</Typography>
        <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
      </div>
      <div className="flex items-center gap-2">
        <Select size="small" value={brand} onChange={onBrand} displayEmpty>
          <MenuItem value=""><em>全部品牌</em></MenuItem>
          {(brandsQ.data ?? []).map((b) => <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>)}
        </Select>
        <Select size="small" value={model} onChange={(e) => setModel(e.target.value)} displayEmpty disabled={!brand}>
          <MenuItem value=""><em>全部车型</em></MenuItem>
          {(modelsQ.data ?? []).map((m) => <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>)}
        </Select>
      </div>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="最小值" value={priceQ.data?.min?.toFixed(0) ?? '-'} /></Grid>
        <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="均值" value={priceQ.data?.avg?.toFixed(0) ?? '-'} /></Grid>
        <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="中位数" value={priceQ.data?.median?.toFixed(0) ?? '-'} /></Grid>
        <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="P95" value={priceQ.data?.p95?.toFixed(0) ?? '-'} subtitle={`样本 ${priceQ.data?.samples ?? 0}`} /></Grid>
      </Grid>
    </div>
  )
}


