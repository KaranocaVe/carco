import ReactECharts from 'echarts-for-react';

export default function StackedBar({ x, series }: { x: string[]; series: { name: string; data: number[] }[] }) {
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { type: 'scroll' },
    grid: { left: 40, right: 24, top: 32, bottom: 24 },
    xAxis: { type: 'category', data: x },
    yAxis: { type: 'value' },
    series: series.map((s) => ({ type: 'bar', name: s.name, stack: 'total', data: s.data })),
  };
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


