import { Grid, MenuItem, Select, Typography, Stack, Box, Autocomplete, TextField } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getSuppliers } from '../../api/catalog'
import { getTransmissionRecall, getTransmissionRecallByModel, getTransmissionRecallUnsold } from '../../api/recalls'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import BarTop from '../../components/charts/BarTop'
import { DataGrid } from '@mui/x-data-grid'
import DataGridBase from '../../components/common/DataGridBase'
import type { GridColDef } from '@mui/x-data-grid'
import { Dayjs } from 'dayjs'

export default function RecallsPage() {
  const suppliersQ = useQuery({ queryKey: ['suppliers'], queryFn: () => getSuppliers() })
  const [supplier, setSupplier] = useState<string>('爱信')
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const params = { supplier, from: toParam(start), to: toParam(end) }

  const allQ = useQuery({ queryKey: ['recallAll', params], queryFn: () => getTransmissionRecall(params), enabled: !!supplier })
  const unsoldQ = useQuery({ queryKey: ['recallUnsold', params], queryFn: () => getTransmissionRecallUnsold(params), enabled: !!supplier })
  const byModelQ = useQuery({ queryKey: ['recallByModel', params], queryFn: () => getTransmissionRecallByModel(params), enabled: !!supplier })
  const cols: GridColDef[] = [
    { field: 'vin', headerName: 'VIN', width: 180 },
    { field: 'serialNumber', headerName: '变速器序列号', width: 180 },
    { field: 'productionDate', headerName: '生产日期', width: 120 },
    { field: 'saleDate', headerName: '销售日期', width: 120 },
    { field: 'customerName', headerName: '客户', width: 160 },
  ]

  const barItems = (byModelQ.data ?? []).map((x) => ({ name: x.modelName, value: x.total }))

  return (
    <Stack spacing={3}>
      <PageHeader
        title="召回分析"
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Autocomplete
              size="small"
              options={(suppliersQ.data ?? []).map((s) => s.name)}
              value={supplier}
              onChange={(_e, v) => setSupplier(v ?? '')}
              clearOnEscape
              renderInput={(params) => <TextField {...params} label="供应商" placeholder="选择供应商" />}
            />
            <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
          </Box>
        }
      />
      <SectionCard title="按车型命中（已售+未售)">
        {byModelQ.isLoading ? null : <BarTop items={barItems} />}
      </SectionCard>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title="命中明细（含已售）">
            <div style={{ height: 420, width: '100%' }}>
              <DataGridBase rows={allQ.data ?? []} getRowId={(r) => `${r.vin}-${r.serialNumber}`} columns={cols} loading={allQ.isLoading} />
            </div>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title="未售命中">
            <div style={{ height: 420, width: '100%' }}>
              <DataGridBase rows={unsoldQ.data ?? []} getRowId={(r) => `${r.vin}-${r.serialNumber}`} columns={cols} loading={unsoldQ.isLoading} />
            </div>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  )
}


