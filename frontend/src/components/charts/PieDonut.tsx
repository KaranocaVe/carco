import ReactECharts from 'echarts-for-react';

export default function PieDonut({ data, title }: { data: { name: string; value: number }[]; title?: string }) {
  const option = {
    title: title ? { text: title } : undefined,
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        data,
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


