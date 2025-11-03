import { Grid, MenuItem, Select, TextField, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands } from '../../api/catalog'
import { getModelBestMonth, getTopModels, getTopModelsByBrand } from '../../api/analytics'
import BarTop from '../../components/charts/BarTop'
import KpiCard from '../../components/common/KpiCard'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import { Dayjs } from 'dayjs'

export default function ModelsPage() {
  const brandsQ = useQuery({ queryKey: ['brands'], queryFn: () => getBrands() })
  const [brand, setBrand] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const params = { start: toParam(start), end: toParam(end) }

  const topGlobalQ = useQuery({ queryKey: ['topModels', params], queryFn: () => getTopModels({ ...params, limit: 15 }) })
  const topByBrandQ = useQuery({ queryKey: ['topModelsByBrand', brand, params], queryFn: () => getTopModelsByBrand(brand, { ...params, limit: 15 }), enabled: !!brand })
  const bestMonthQ = useQuery({ queryKey: ['bestMonth', model, params], queryFn: () => getModelBestMonth(model, params), enabled: !!model })

  const onBrandChange = (e: SelectChangeEvent) => setBrand(e.target.value)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">车型分析</Typography>
        <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
      </div>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <BarTop title="全球车型销量Top" items={(topGlobalQ.data ?? []).map((x) => ({ name: x.modelName, value: x.units }))} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <div className="flex items-center gap-2 mb-2">
            <Select size="small" value={brand} onChange={onBrandChange} displayEmpty>
              <MenuItem value=""><em>选择品牌</em></MenuItem>
              {(brandsQ.data ?? []).map((b) => (
                <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>
              ))}
            </Select>
            <TextField size="small" label="车型名" placeholder="例如：哈弗H4" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <BarTop title={brand ? `${brand} 车型销量Top` : '选择品牌后显示'} items={(topByBrandQ.data ?? []).map((x) => ({ name: x.modelName, value: x.units }))} />
        </Grid>
      </Grid>
      {bestMonthQ.data && (
        <KpiCard title={`${bestMonthQ.data.modelName} 最佳月份`} value={`${bestMonthQ.data.month?.slice(0,7)} ・ ${bestMonthQ.data.units} 台`} subtitle={`金额 ${Math.round(bestMonthQ.data.revenue)} 元`} />
      )}
    </div>
  )
}


