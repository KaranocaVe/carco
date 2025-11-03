import { Grid, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getAgeing, getUnsold } from '../../api/inventory'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import { Dayjs } from 'dayjs'
import PieDonut from '../../components/charts/PieDonut'

export default function InventoryPage() {
  const { e: e0 } = defaultRange()
  const [asOf, setAsOf] = useState<Dayjs>(e0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const params = { asOf: toParam(asOf), page: page + 1, pageSize }
  const unsoldQ = useQuery({ queryKey: ['unsold', params], queryFn: () => getUnsold(params) })
  const ageingQ = useQuery({ queryKey: ['ageing', params], queryFn: () => getAgeing({ asOf: params.asOf }) })

  const cols: GridColDef[] = [
    { field: 'vin', headerName: 'VIN', width: 180 },
    { field: 'dealerName', headerName: '经销商', width: 160 },
    { field: 'receivedAt', headerName: '入库日期', width: 120 },
    { field: 'daysInInventory', headerName: '在库天数', width: 120 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">库存</Typography>
        <DateRangePicker start={asOf} end={asOf} onChange={(_s, e) => setAsOf(e)} />
      </div>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={unsoldQ.data ?? []}
              getRowId={(r) => r.vin}
              columns={cols}
              paginationMode="server"
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize) }}
              rowCount={(unsoldQ.data ?? []).length + pageSize}
              disableRowSelectionOnClick
            />
          </div>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <PieDonut title="库存龄期" data={(ageingQ.data ?? []).map((b) => ({ name: b.bucket, value: b.count }))} />
        </Grid>
      </Grid>
    </div>
  )
}


