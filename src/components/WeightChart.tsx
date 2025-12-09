
import React from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { WeightEntry, WeightGoal } from "@/types";

interface WeightChartProps {
  entries: WeightEntry[];
  goal?: WeightGoal | null;
  filterCount: number;
  isLoading: boolean;
}

export const WeightChart = ({ entries, goal, filterCount, isLoading }: WeightChartProps) => {
  // Sort entries by date and take only the specified number
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime())
    .slice(-filterCount);
    
  const chartData = sortedEntries.map((entry, index) => ({
    date: format(new Date(entry.week_start_date), 'MMM d'),
    weight: entry.weight_kg,
    week: `Week ${index + 1}`
  }));
  
  // Calculate min and max for Y axis domain
  const weights = chartData.map(item => item.weight);
  const minWeight = weights.length ? Math.floor(Math.min(...weights) - 2) : 50;
  const maxWeight = weights.length ? Math.ceil(Math.max(...weights) + 2) : 100;
  
  // Adjust domain if goal exists
  const goalWeight = goal?.target_weight;
  const yMin = goalWeight && goalWeight < minWeight ? Math.floor(goalWeight - 2) : minWeight;
  const yMax = goalWeight && goalWeight > maxWeight ? Math.ceil(goalWeight + 2) : maxWeight;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading weight data...</p>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <p>No weight entries yet</p>
        <p className="text-sm mt-2">Record your weight to see your trend over time</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          domain={[yMin, yMax]} 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          width={40}
          label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
        />
        <Tooltip 
          formatter={(value) => [`${value} kg`, 'Weight']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          name="Weight"
          type="monotone"
          dataKey="weight"
          stroke="#8b5cf6" // Purple color for MyMed theme
          strokeWidth={2}
          activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
          connectNulls={true}
        />
        {goalWeight && (
          <ReferenceLine
            y={goalWeight}
            label={{ value: `Goal: ${goalWeight} kg`, position: 'insideBottomRight' }}
            stroke="#10b981" // Green color for goal
            strokeDasharray="3 3"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};
