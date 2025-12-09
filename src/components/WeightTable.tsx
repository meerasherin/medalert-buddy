
import React from 'react';
import { format } from 'date-fns';
import { WeightEntry } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeightTableProps {
  entries: WeightEntry[];
  filterCount: number;
  isLoading: boolean;
}

export const WeightTable = ({ entries, filterCount, isLoading }: WeightTableProps) => {
  // Sort entries by date (newest first) and take only the specified number
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime())
    .slice(0, filterCount);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16">
        <p>Loading weight history...</p>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-muted-foreground">
        <p>No weight entries recorded yet</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>Your weight history</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Week</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead className="text-right">Weight (kg)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry, index) => {
            const weekStartDate = new Date(entry.week_start_date);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            
            return (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entries.length - index}</TableCell>
                <TableCell>
                  {format(weekStartDate, "MMM d")} - {format(weekEndDate, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">{entry.weight_kg}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
