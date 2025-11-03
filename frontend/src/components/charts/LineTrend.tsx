import ReactECharts from 'echarts-for-react';

export default function LineTrend({ x, series }: { x: string[]; series: { name: string; data: number[] }[] }) {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { type: 'scroll' },
    grid: { left: 32, right: 24, top: 32, bottom: 24 },
    xAxis: { type: 'category', data: x },
    yAxis: { type: 'value' },
    series: series.map((s) => ({ type: 'line', smooth: true, name: s.name, data: s.data })),
  };
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


