import { Grid, MenuItem, Select, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModelsByBrand, getColors, getSuppliers, getTransmissions } from '../../api/catalog'

export default function CatalogPage() {
  const brandsQ = useQuery({ queryKey: ['brands'], queryFn: () => getBrands() })
  const [brand, setBrand] = useState<string>('')
  const modelsQ = useQuery({ queryKey: ['models', brand], queryFn: () => getModelsByBrand(brand), enabled: !!brand })
  const colorsQ = useQuery({ queryKey: ['colors'], queryFn: () => getColors() })
  const suppliersQ = useQuery({ queryKey: ['suppliers'], queryFn: () => getSuppliers() })
  const transmissionsQ = useQuery({ queryKey: ['transmissions'], queryFn: () => getTransmissions() })

  return (
    <div className="space-y-4">
      <Typography variant="h5">目录</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Typography variant="subtitle1" className="mb-2">品牌</Typography>
          <div className="flex items-center gap-2">
            <Select size="small" value={brand} onChange={(e: SelectChangeEvent) => setBrand(e.target.value)} displayEmpty>
              <MenuItem value=""><em>选择品牌</em></MenuItem>
              {(brandsQ.data ?? []).map((b) => <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>)}
            </Select>
            <Select size="small" value={''} displayEmpty disabled={!brand}>
              <MenuItem value=""><em>车型</em></MenuItem>
              {(modelsQ.data ?? []).map((m) => <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>)}
            </Select>
          </div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Typography variant="subtitle1" className="mb-2">颜色</Typography>
          <div className="flex flex-wrap gap-2">
            {(colorsQ.data ?? []).map((c) => <span key={c.id} className="px-2 py-1 rounded bg-gray-100 text-sm">{c.name}</span>)}
          </div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Typography variant="subtitle1" className="mb-2">供应商 / 变速器</Typography>
          <div className="flex flex-col gap-2">
            <div className="text-sm">供应商：{(suppliersQ.data ?? []).map((s) => s.name).join('、')}</div>
            <div className="text-sm">变速器：{(transmissionsQ.data ?? []).map((t) => `${t.name}(${t.specCode})`).join('、')}</div>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}


