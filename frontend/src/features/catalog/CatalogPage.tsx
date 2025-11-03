import { Grid, Typography, Stack, Box, Autocomplete, TextField, Chip } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModelsByBrand, getColors, getSuppliers, getTransmissions } from '../../api/catalog'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'

export default function CatalogPage() {
  const brandsQ = useQuery({ queryKey: ['brands'], queryFn: () => getBrands() })
  const [brand, setBrand] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const modelsQ = useQuery({ queryKey: ['models', brand, color], queryFn: () => getModelsByBrand(brand, { color }), enabled: !!brand })
  const colorsQ = useQuery({ queryKey: ['colors', brand, model], queryFn: () => getColors({ brand, model }) })
  const suppliersQ = useQuery({ queryKey: ['suppliers', brand, model, color], queryFn: () => getSuppliers({ brand, model, color }) })
  const transmissionsQ = useQuery({ queryKey: ['transmissions', brand, model, color], queryFn: () => getTransmissions({ brand, model, color }) })

  return (
    <Stack spacing={3}>
      <PageHeader title="目录" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="品牌与车型" actions={
            <Autocomplete
              size="small"
              options={(brandsQ.data ?? []).map((b) => b.name)}
              value={brand}
              onChange={(_e, v) => { setBrand(v ?? ''); setModel(''); setColor(''); }}
              renderInput={(params) => <TextField {...params} label="品牌" placeholder="选择品牌" />}
            />
          }>
            <Autocomplete
              size="small"
              options={(modelsQ.data ?? []).map((m) => m.name)}
              value={model}
              onChange={(_e, v) => setModel(v ?? '')}
              renderInput={(params) => <TextField {...params} label="车型" placeholder={brand ? '选择车型' : '先选择品牌'} />}
              disabled={!brand}
            />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="颜色">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(colorsQ.data ?? []).map((c) => (
                <Chip
                  key={c.id}
                  size="small"
                  label={c.name}
                  clickable
                  onClick={() => setColor((prev) => (prev === c.name ? '' : c.name))}
                  variant={color === c.name ? 'filled' : 'outlined'}
                  color={color === c.name ? 'primary' : 'default'}
                />
              ))}
            </Box>
            {!!color && <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>已选：{color}</Typography>}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="供应商 / 变速器">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">供应商：{(suppliersQ.data ?? []).map((s) => s.name).join('、')}</Typography>
              <Typography variant="body2">变速器：{(transmissionsQ.data ?? []).map((t) => `${t.name}(${t.specCode})`).join('、')}</Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  )
}


