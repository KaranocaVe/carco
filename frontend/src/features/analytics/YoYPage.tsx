import { Grid, TextField, Typography } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useQuery } from '@tanstack/react-query'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'
import { getYoY } from '../../api/analytics'
import KpiCard from '../../components/common/KpiCard'

export default function YoYPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'))
  const q = useQuery({ queryKey: ['yoy', month.format('YYYY-MM')], queryFn: () => getYoY({ month: month.format('YYYY-MM-01') }) })

  const d = q.data
  const pmUnits = d ? ((d.units - d.prevMonthUnits) / Math.max(1, d.prevMonthUnits)) * 100 : 0
  const pyUnits = d ? ((d.units - d.prevYearUnits) / Math.max(1, d.prevYearUnits)) * 100 : 0
  const pmRev = d ? ((d.revenue - d.prevMonthRevenue) / Math.max(1, d.prevMonthRevenue)) * 100 : 0
  const pyRev = d ? ((d.revenue - d.prevYearRevenue) / Math.max(1, d.prevYearRevenue)) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h5">同比环比</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker enableAccessibleFieldDOMStructure={false} label="月份" views={["year", "month"]} value={month} onChange={(v) => v && setMonth(v.startOf('month'))} slots={{ textField: TextField }} />
        </LocalizationProvider>
      </div>
      {d && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="当月销量" value={d.units} subtitle={`环比 ${pmUnits.toFixed(1)}% ・ 同比 ${pyUnits.toFixed(1)}%`} /></Grid>
          <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="当月金额" value={Math.round(d.revenue)} subtitle={`环比 ${pmRev.toFixed(1)}% ・ 同比 ${pyRev.toFixed(1)}%`} /></Grid>
          <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="上月销量" value={d.prevMonthUnits} /></Grid>
          <Grid size={{ xs: 12, lg: 3 }}><KpiCard title="上年同月销量" value={d.prevYearUnits} /></Grid>
        </Grid>
      )}
    </div>
  )
}


