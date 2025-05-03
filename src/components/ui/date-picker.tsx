
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

export interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean | ((date: Date) => boolean);
  className?: string;
  placeholder?: string;
  disableFutureDates?: boolean;
  disablePastDates?: boolean;
}

export function DatePicker({ 
  date, 
  onDateChange, 
  disabled = false, 
  className,
  placeholder = "Pick a date",
  disableFutureDates = false,
  disablePastDates = false
}: DatePickerProps) {
  // Create a dynamic disabled function that combines the original disabled prop
  // with the disableFutureDates and disablePastDates props
  const getDisabledState = React.useCallback(
    (day: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if the original disabled prop is a function and apply it
      if (typeof disabled === 'function') {
        return disabled(day);
      }

      // Apply disableFutureDates or disablePastDates logic
      if (disableFutureDates && day > today) {
        return true;
      }

      if (disablePastDates && day < today) {
        return true;
      }

      // Return the original disabled value if it's a boolean
      return disabled === true;
    },
    [disabled, disableFutureDates, disablePastDates]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={getDisabledState}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
