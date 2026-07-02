import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { Inspection } from '@/types';
import InspectionHistoryTable from './InspectionHistoryTable';

interface FilterOptions {
  inspector: string;
  dateRange: { from: Date | null, to: Date | null };
  result: string;
  ppe_type: string;
}

const InspectionHistory = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectors, setInspectors] = useState<string[]>([]);
  const [ppeTypes, setPpeTypes] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>({
    inspector: '',
    dateRange: { from: null, to: null },
    result: '',
    ppe_type: '',
  });

  const filteredInspections = useMemo(() => {
    return inspections?.filter((inspection) => {
      if (selectedFilters.inspector && inspection.inspector_id !== selectedFilters.inspector) {
        return false;
      }
      if (selectedFilters.result && inspection.overall_result !== selectedFilters.result) {
        return false;
      }
      if (selectedFilters.ppe_type && inspection.ppe_id) {
        // Note: This would need to be joined with PPE data in a real implementation
        return true;
      }
      if (selectedFilters.dateRange?.from) {
        const inspectionDate = new Date(inspection.date);
        if (inspectionDate < selectedFilters.dateRange.from) {
          return false;
        }
      }
      if (selectedFilters.dateRange?.to) {
        const inspectionDate = new Date(inspection.date);
        if (inspectionDate > selectedFilters.dateRange.to) {
          return false;
        }
      }
      return true;
    }) || [];
  }, [inspections, selectedFilters]);

  const handleFilterChange = (filterName: keyof FilterOptions, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filter Inspections</CardTitle>
          <CardDescription>Apply filters to narrow down inspection history</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inspector">Inspector</Label>
              <Select onValueChange={(value) => handleFilterChange('inspector', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select inspector" />
                </SelectTrigger>
                <SelectContent>
                  {inspectors.map(inspector => (
                    <SelectItem key={inspector} value={inspector}>{inspector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="result">Result</Label>
              <Select onValueChange={(value) => handleFilterChange('result', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ppe_type">PPE Type</Label>
              <Select onValueChange={(value) => handleFilterChange('ppe_type', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select PPE Type" />
                </SelectTrigger>
                <SelectContent>
                  {ppeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Date Range</Label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !selectedFilters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedFilters.dateRange.from ? (
                      format(selectedFilters.dateRange.from, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedFilters.dateRange.from}
                    onSelect={(date) => handleFilterChange('dateRange', { ...selectedFilters.dateRange, from: date })}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !selectedFilters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedFilters.dateRange.to ? (
                      format(selectedFilters.dateRange.to, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedFilters.dateRange.to}
                    onSelect={(date) => handleFilterChange('dateRange', { ...selectedFilters.dateRange, to: date })}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <InspectionHistoryTable inspections={filteredInspections} />
    </div>
  );
};

export default InspectionHistory;
