
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

type DatePickerProps = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
};

export function DatePicker({ 
  date, 
  setDate, 
  className,
  placeholder = "Pick a date",
  disabled = false,
  label,
  disablePastDates = false,
  disableFutureDates = false
}: DatePickerProps) {
  const today = new Date();
  const isMobile = useIsMobile();
  
  // Disable dates based on props
  const isDateDisabled = (date: Date) => {
    if (disablePastDates && date < new Date(today.setHours(0, 0, 0, 0))) {
      return true;
    }
    if (disableFutureDates && date > new Date(today.setHours(23, 59, 59, 999))) {
      return true;
    }
    return false;
  };

  return (
    <div className={className}>
      {label && <div className="mb-2 text-sm font-medium">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          sideOffset={5}
          align={isMobile ? "center" : "start"}
          side={isMobile ? "bottom" : "right"}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={isDateDisabled}
            initialFocus
            className="p-3 pointer-events-auto border rounded-md shadow"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
