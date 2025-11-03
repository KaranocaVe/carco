import ReactECharts from 'echarts-for-react'
import { useMuiTheme } from './chartTheme'
import * as echarts from 'echarts'

export default function Sparkline({ data, color }: { data: number[]; color?: string }) {
  const theme = useMuiTheme()
  const c = color || theme.palette.primary.main
  const option = {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', data: data.map((_v, i) => i), show: false },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line', data,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: c },
      areaStyle: {
        color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${c}55` },
          { offset: 1, color: `${c}00` },
        ]),
      },
    }],
  } as any
  return <ReactECharts option={option} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }} />
}


