import ReactECharts from 'echarts-for-react';
import { useMuiTheme, buildChartBase } from './chartTheme';

export default function BarTop({ items, valueKey = 'value', nameKey = 'name', title, valueFormatter }: { items: any[]; valueKey?: string; nameKey?: string; title?: string; valueFormatter?: (v: number) => string }) {
  const theme = useMuiTheme();
  const names = items.map((i) => i[nameKey]);
  const values = items.map((i) => i[valueKey]);
  const option = {
    ...buildChartBase(theme),
    title: title ? { text: title } : undefined,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 24, top: 36, bottom: 24 },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary },
      splitLine: { show: false },
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: { borderRadius: 6 },
      barCategoryGap: '24%',
      label: {
        show: true,
        position: 'right',
        color: theme.palette.text.secondary,
        formatter: (p: any) => valueFormatter ? valueFormatter(Number(p.value)) : String(p.value),
      },
    }],
  } as any;
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


