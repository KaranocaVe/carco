import ReactECharts from 'echarts-for-react';
import { useMuiTheme, buildChartBase } from './chartTheme';

export default function StackedBar({ x, series }: { x: string[]; series: { name: string; data: number[] }[] }) {
  const theme = useMuiTheme();
  const option = {
    ...buildChartBase(theme),
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { type: 'scroll', textStyle: { color: theme.palette.text.secondary } },
    grid: { left: 36, right: 20, top: 28, bottom: 24 },
    xAxis: {
      type: 'category', data: x,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
    },
    series: series.map((s) => ({ type: 'bar', name: s.name, stack: 'total', data: s.data, itemStyle: { borderRadius: 4 } })),
  } as any;
  return <ReactECharts option={option} style={{ height: 360, touchAction: 'pan-y' }} />;
}


