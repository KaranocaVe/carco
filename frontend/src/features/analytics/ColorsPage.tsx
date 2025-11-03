import { Typography, Stack } from '@mui/material'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { defaultRange, toParam } from '../../components/common/DateRangePicker'
import DateRangePicker from '../../components/common/DateRangePicker'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/layout/SectionCard'
import { ChartSkeleton } from '../../components/common/Skeletons'
import { getTopColors } from '../../api/analytics'
import PieDonut from '../../components/charts/PieDonut'
import { Dayjs } from 'dayjs'

export default function ColorsPage() {
  const { s: s0, e: e0 } = defaultRange()
  const [start, setStart] = useState<Dayjs>(s0)
  const [end, setEnd] = useState<Dayjs>(e0)
  const params = { start: toParam(start), end: toParam(end) }
  const colorsQ = useQuery({ queryKey: ['colors-analytics', params], queryFn: () => getTopColors({ ...params, limit: 12 }) })
  return (
    <Stack spacing={3}>
      <PageHeader title="颜色分析" actions={<DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />} />
      <SectionCard title="颜色占比">
        {colorsQ.isLoading ? <ChartSkeleton /> : <PieDonut data={(colorsQ.data ?? []).map((c) => ({ name: c.colorName, value: c.units }))} />}
      </SectionCard>
    </Stack>
  )
}


