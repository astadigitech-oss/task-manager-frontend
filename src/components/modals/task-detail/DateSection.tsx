import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateSectionProps {
  startDate?: string;
  dueDate?: string;
  onDateChange: (date: Date | undefined, field: "startDate" | "dueDate") => void;
  readOnly?: boolean;
}

export function DateSection({
  startDate,
  dueDate,
  onDateChange,
  readOnly = false,
}: DateSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <CalendarIcon className="h-4 w-4" />
          Start Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted"
              )}
              disabled={readOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(new Date(startDate), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          {!readOnly && (
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date: Date | undefined) => onDateChange(date, "startDate")}
              />
            </PopoverContent>
          )}
        </Popover>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <CalendarIcon className="h-4 w-4" />
          Due Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted"
              )}
              disabled={readOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(new Date(dueDate), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          {!readOnly && (
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(date: Date | undefined) => onDateChange(date, "dueDate")}
              />
            </PopoverContent>
          )}
        </Popover>
      </div>
    </div>
  );
}

