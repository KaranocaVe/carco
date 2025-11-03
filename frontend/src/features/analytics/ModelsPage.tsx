import { Grid, TextField, Stack, Box, Autocomplete } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModelsByBrand } from '../../api/catalog'
import { getModelBestMonth, getTopModels, getTopModelsByBrand } from '../../api/analytics'
import BarTop from '../../components/charts/BarTop'
import KpiCard from '../../components/common/KpiCard'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import { ChartSkeleton, KpiCardSkeleton } from '../../components/common/Skeletons'
import { Dayjs } from 'dayjs'

export default function ModelsPage() {
  const brandsQ = useQuery({ queryKey: ['brands'], queryFn: () => getBrands() })
  const [brand, setBrand] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const modelsQ = useQuery({ queryKey: ['models', brand], queryFn: () => getModelsByBrand(brand), enabled: !!brand })
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const params = { start: toParam(start), end: toParam(end) }

  const topGlobalQ = useQuery({ queryKey: ['topModels', params], queryFn: () => getTopModels({ ...params, limit: 15 }) })
  const topByBrandQ = useQuery({ queryKey: ['topModelsByBrand', brand, params], queryFn: () => getTopModelsByBrand(brand, { ...params, limit: 15 }), enabled: !!brand })
  const bestMonthQ = useQuery({ queryKey: ['bestMonth', model, params], queryFn: () => getModelBestMonth(model, params), enabled: !!model })

  const onBrandChange = (e: SelectChangeEvent) => setBrand(e.target.value)

  const loadingGlobal = topGlobalQ.isLoading
  const loadingBrand = topByBrandQ.isLoading
  const loadingBest = bestMonthQ.isLoading
  return (
    <Stack spacing={3}>
      <PageHeader title="车型分析" actions={<DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title="全球车型销量Top">
            {loadingGlobal ? <ChartSkeleton /> : <BarTop items={(topGlobalQ.data ?? []).map((x) => ({ name: x.modelName, value: x.units }))} valueFormatter={(v) => `${v} 台`} />}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title={brand ? `${brand} 车型销量Top` : '选择品牌后显示'}
            actions={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Autocomplete
                  size="small"
                  options={(brandsQ.data ?? []).map((b) => b.name)}
                  value={brand}
                  onChange={(_e, v) => setBrand(v ?? '')}
                  clearOnEscape
                  renderInput={(params) => <TextField {...params} label="品牌" placeholder="选择品牌" />}
                />
                <Autocomplete
                  size="small"
                  options={(modelsQ.data ?? []).map((m) => m.name)}
                  value={model}
                  onChange={(_e, v) => setModel(v ?? '')}
                  clearOnEscape
                  renderInput={(params) => <TextField {...params} label="车型名" placeholder="例如：哈弗H4" />}
                  disabled={!brand}
                />
              </Box>
            }
          >
            {loadingBrand ? <ChartSkeleton /> : <BarTop items={(topByBrandQ.data ?? []).map((x) => ({ name: x.modelName, value: x.units }))} valueFormatter={(v) => `${v} 台`} />}
          </SectionCard>
        </Grid>
      </Grid>
      {loadingBest ? <KpiCardSkeleton /> : (bestMonthQ.data && (
        <KpiCard title={`${bestMonthQ.data.modelName} 最佳月份`} value={`${bestMonthQ.data.month?.slice(0,7)} ・ ${bestMonthQ.data.units} 台`} subtitle={`金额 ${Math.round(bestMonthQ.data.revenue)} 元`} />
      ))}
    </Stack>
  )
}


