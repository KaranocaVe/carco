import { Grid, MenuItem, Select, Typography, Stack, Box, Autocomplete, TextField } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModelsByBrand } from '../../api/catalog'
import { getPriceSummary } from '../../api/analytics'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import { KpiCardSkeleton } from '../../components/common/Skeletons'
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="最小值" value={priceQ.data?.min?.toFixed(0) ?? '-'} />}</Grid>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="均值" value={priceQ.data?.avg?.toFixed(0) ?? '-'} />}</Grid>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="中位数" value={priceQ.data?.median?.toFixed(0) ?? '-'} />}</Grid>
          <Grid size={{ xs: 12, lg: 3 }}>{priceQ.isLoading ? <KpiCardSkeleton /> : <KpiCard title="P95" value={priceQ.data?.p95?.toFixed(0) ?? '-'} subtitle={`样本 ${priceQ.data?.samples ?? 0}`} />}</Grid>
        </Grid>
      </SectionCard>
    </Stack>
  )
}


