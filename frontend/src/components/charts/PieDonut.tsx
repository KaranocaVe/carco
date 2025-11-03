import ReactECharts from 'echarts-for-react';
import { useMuiTheme, buildChartBase } from './chartTheme';

export default function PieDonut({ data, title }: { data: { name: string; value: number }[]; title?: string }) {
  const theme = useMuiTheme();
  const option = {
    ...buildChartBase(theme),
    title: title ? { text: title } : undefined,
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: theme.palette.text.secondary } },
    series: [
      {
        name: '分布',
        type: 'pie',
        radius: ['46%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: theme.palette.background.paper },
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  } as any;
  return <ReactECharts option={option} style={{ height: 360 }} />;
}


