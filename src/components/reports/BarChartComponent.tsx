
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface BarChartComponentProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  barColor?: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  xKey,
  yKey,
  title,
  height = 300,
  barColor = "#2563eb"
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md border">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
      <div style={{ height: `${height}px`, width: '100%' }}>
        <ChartContainer 
          config={{
            bar: { color: barColor }
          }}
        >
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <Bar 
              dataKey={yKey} 
              radius={[4, 4, 0, 0]} 
              className="fill-[--color-bar]" 
            />
            <ChartTooltip 
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              content={<ChartTooltipContent />}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
