import ReactECharts from 'echarts-for-react';
import { useMuiTheme, buildChartBase } from './chartTheme';
import * as echarts from 'echarts';

export default function LineTrend({ x, series }: { x: string[]; series: { name: string; data: number[] }[] }) {
  const theme = useMuiTheme();
  const base = buildChartBase(theme);
  const palette = (base.color as string[]) || [];
  const toRgba = (hex: string, alpha: number) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return hex;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const option = {
    ...base,
    tooltip: { trigger: 'axis', order: 'valueDesc' },
    legend: { type: 'scroll', top: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 6, textStyle: { color: theme.palette.text.secondary } },
    grid: { left: 32, right: 24, top: 48, bottom: 28 },
    xAxis: {
      type: 'category',
      data: x,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
    },
    series: series.map((s, idx) => ({
      type: 'line', smooth: true, smoothMonotone: 'x', name: s.name, data: s.data,
      lineStyle: { width: 3, shadowBlur: 8, shadowColor: toRgba(palette[idx % palette.length] || '#0A84FF', 0.45) },
      areaStyle: {
        color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: toRgba(palette[idx % palette.length] || '#0A84FF', 0.28) },
          { offset: 1, color: toRgba(palette[idx % palette.length] || '#0A84FF', 0.0) },
        ]),
      },
      showSymbol: false,
      symbol: 'circle', symbolSize: 4,
      emphasis: { focus: 'series', lineStyle: { width: 4 } },
      blur: { lineStyle: { opacity: 0.25 } },
      markLine: { data: [{ type: 'average', name: '均值' }], lineStyle: { type: 'dashed', color: theme.palette.divider } },
      markPoint: { data: [{ type: 'max', name: '峰值' }], symbolSize: 32 },
      animationEasing: 'quartOut',
    })),
  } as any;
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


