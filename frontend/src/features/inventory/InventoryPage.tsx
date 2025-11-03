import { Grid, Typography, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import DataGridBase from '../../components/common/DataGridBase'
import type { GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getAgeing, getUnsold } from '../../api/inventory'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
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
    <Stack spacing={3}>
      <PageHeader title="库存" actions={<DateRangePicker start={asOf} end={asOf} onChange={(_s, e) => setAsOf(e)} />} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="未售清单">
            <div style={{ height: 520, width: '100%' }}>
              <DataGridBase
                rows={unsoldQ.data ?? []}
                getRowId={(r) => r.vin}
                columns={cols}
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize) }}
                rowCount={(page * pageSize) + (unsoldQ.data?.length ?? 0) + ((unsoldQ.data?.length ?? 0) === pageSize ? pageSize : 0)}
                loading={unsoldQ.isLoading}
              />
            </div>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="库存龄期">
            <PieDonut data={(ageingQ.data ?? []).map((b) => ({ name: b.bucket, value: b.count }))} />
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  )
}


