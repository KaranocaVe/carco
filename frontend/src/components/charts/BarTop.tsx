import ReactECharts from 'echarts-for-react';

export default function BarTop({ items, valueKey = 'value', nameKey = 'name', title }: { items: any[]; valueKey?: string; nameKey?: string; title?: string }) {
  const names = items.map((i) => i[nameKey]);
  const values = items.map((i) => i[valueKey]);
  const option = {
    title: title ? { text: title } : undefined,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 24, top: 32, bottom: 24 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: names, inverse: true },
    series: [{ type: 'bar', data: values }],
  };
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


