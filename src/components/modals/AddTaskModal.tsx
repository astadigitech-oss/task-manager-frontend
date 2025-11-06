"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { X, ClipboardList, User, Calendar as CalendarIcon, Tag, Layout } from "lucide-react"
import { format } from "date-fns"

export default function AddTaskModal() {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [dueDate, setDueDate] = useState<Date | undefined>()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + New Task
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg sm:max-w-xl bg-gray-50">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-lg font-semibold">Add New Task</DialogTitle>
          <DialogClose asChild>
            {/* <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-200">
              <X className="w-4 h-4" />
            </Button> */}
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <Select defaultValue="project-1">
            <SelectTrigger className="w-fit border border-gray-300 bg-white">
              <ClipboardList className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project-1">Project 1</SelectItem>
              <SelectItem value="project-2">Project 2</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Task name"
            className="bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500"
          />

          <Textarea
            placeholder="Description"
            className="min-h-[120px] bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500"
          />

          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <Select>
              <SelectTrigger className="w-full bg-black text-white text-sm">
                <Layout className="w-4 h-4 mr-2" />
                <SelectValue placeholder="On Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onboard">On Board</SelectItem>
                <SelectItem value="onprogress">On Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full bg-black text-white text-sm">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member1">Member 1</SelectItem>
                <SelectItem value="member2">Member 2</SelectItem>
                <SelectItem value="member3">Member 3</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  className="w-full bg-black text-white text-sm flex items-center justify-start gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {startDate ? (
                    <span>{format(startDate, "MMM d, yyyy")}</span>
                  ) : (
                    <span>Start Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  className="w-full bg-black text-white text-sm flex items-center justify-start gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {dueDate ? (
                    <span>{format(dueDate, "MMM d, yyyy")}</span>
                  ) : (
                    <span>Due Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select>
              <SelectTrigger className="w-full bg-black text-white text-sm">
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button className="bg-black text-white hover:bg-gray-900">
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
