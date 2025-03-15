
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface PieChartComponentProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}

const DEFAULT_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#6366f1", "#8b5cf6"];

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  title,
  height = 300,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  outerRadius = 80,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md border">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Prepare data with custom colors
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length]
  }));

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
      <div style={{ height: `${height}px`, width: '100%' }}>
        <ChartContainer 
          config={{
            ...chartData.reduce((acc, item) => ({
              ...acc,
              [item.name]: { 
                color: item.color,
                label: item.name
              }
            }), {})
          }}
        >
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
            />
            <ChartLegend
              payload={chartData.map(item => ({
                value: item.name,
                color: item.color,
              }))}
            />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default PieChartComponent;
