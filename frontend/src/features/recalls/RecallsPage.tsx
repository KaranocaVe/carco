import { Grid, MenuItem, Select, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getSuppliers } from '../../api/catalog'
import { getTransmissionRecall, getTransmissionRecallByModel, getTransmissionRecallUnsold } from '../../api/recalls'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import BarTop from '../../components/charts/BarTop'
import { DataGrid } from '@mui/x-data-grid'
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">召回分析</Typography>
        <div className="flex items-center gap-2">
          <Select size="small" value={supplier} onChange={(e: SelectChangeEvent) => setSupplier(e.target.value)}>
            {(suppliersQ.data ?? []).map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
          </Select>
          <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
        </div>
      </div>
      <BarTop title="按车型命中（已售+未售）" items={barItems} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Typography variant="subtitle1" className="mb-2">命中明细（含已售）</Typography>
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid rows={allQ.data ?? []} getRowId={(r) => `${r.vin}-${r.serialNumber}`} columns={cols} disableRowSelectionOnClick />
          </div>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Typography variant="subtitle1" className="mb-2">未售命中</Typography>
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid rows={unsoldQ.data ?? []} getRowId={(r) => `${r.vin}-${r.serialNumber}`} columns={cols} disableRowSelectionOnClick />
          </div>
        </Grid>
      </Grid>
    </div>
  )
}


