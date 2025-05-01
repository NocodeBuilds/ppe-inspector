
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  formatter?: (value: any, row?: any) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  isLoading?: boolean;
  actions?: (row: T) => React.ReactNode;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  actions,
  onSort,
  className,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    if (onSort) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(
                  column.sortable ? "cursor-pointer whitespace-nowrap" : "whitespace-nowrap",
                  column.className
                )}
                onClick={() => column.sortable ? handleSort(column.key) : undefined}
              >
                {column.header}
                {column.sortable && (
                  <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                )}
              </TableHead>
            ))}
            {actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.formatter 
                    ? column.formatter(row[column.key], row) 
                    : row[column.key]?.toString() || (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </TableCell>
              ))}
              {actions && (
                <TableCell className="text-right">
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Common formatters that can be used with the DataTable
export const Formatters = {
  date: (value: string | Date) => {
    if (!value) return <span className="text-muted-foreground">N/A</span>;
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime()) 
      ? format(date, 'MMM d, yyyy') 
      : <span className="text-muted-foreground">Invalid Date</span>;
  },
  
  badge: (value: string, variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning") => {
    if (!value) return <span className="text-muted-foreground">N/A</span>;
    
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = variant || "secondary";
    
    // Auto-assign variant based on common status words if not provided
    if (!variant) {
      const valueLower = value.toLowerCase();
      if (valueLower === 'pass' || valueLower === 'active' || valueLower === 'approved') {
        badgeVariant = 'success';
      } else if (valueLower === 'fail' || valueLower === 'rejected' || valueLower === 'error') {
        badgeVariant = 'destructive';
      } else if (valueLower === 'pending' || valueLower === 'warning' || valueLower === 'review') {
        badgeVariant = 'warning';
      }
    }
    
    return <Badge variant={badgeVariant}>{value}</Badge>;
  }
};
