"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";
import { TASK_SORT_OPTIONS } from "@/constants//task";
import { TaskSortOption } from "@/types/shared/filter";

interface TaskSortDropdownProps {
  value: TaskSortOption;
  onChange: (value: TaskSortOption) => void;
  className?: string;
}

export function TaskSortDropdown({
  value,
  onChange,
  className,
}: TaskSortDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = TASK_SORT_OPTIONS.find(
    (opt) => opt.value === value
  );
  const Icon = selectedOption?.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between gap-2", className)}
          size="sm"
        >
          {Icon && <Icon className="h-4 w-4" />}

          <span className="hidden sm:inline">
            {selectedOption?.label ?? "Sort by..."}
          </span>

          <span className="sm:hidden">Sort</span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-70 p-0" align="end">
        <Command>
          <CommandInput placeholder="Search sort option..." />
          <CommandEmpty>No sort option found.</CommandEmpty>

          <CommandGroup>
            {TASK_SORT_OPTIONS.map((option) => {
              const OptionIcon = option.icon;

              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {OptionIcon && (
                    <OptionIcon className="mr-2 h-4 w-4" />
                  )}

                  <span>{option.label}</span>

                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
