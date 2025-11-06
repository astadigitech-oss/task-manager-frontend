"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Calendar as CalendarIcon,
  Tag,
  User,
  X,
  Paperclip,
  Info,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface Task {
  id: number
  title: string
  status?: string
  assignee?: string
  date?: string
  priority?: string
  description?: string
  notes?: string
  attachments?: string[]
}

export default function TaskDetailModal({
  task,
  onClose,
}: {
  task: Task
  onClose: () => void
}) {
  const [status, setStatus] = useState(task?.status || "On Progress")
  const [title, setTitle] = useState(task.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [description, setDescription] = useState(task.description || "")
  const [notes, setNotes] = useState(task.notes || "")
  const [priority, setPriority] = useState(task.priority || "Normal")
  const [assignee, setAssignee] = useState(task.assignee || "AB")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="h-full sm:h-auto sm:max-w-5xl bg-white p-6 rounded-xl shadow-lg">
        {/* Header */}
        <DialogHeader className="flex justify-between items-start mb-4">
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="text-2xl font-semibold text-gray-900 border-none shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          ) : (
            <DialogTitle
              className="text-2xl font-semibold text-gray-900 cursor-pointer hover:underline"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </DialogTitle>
          )}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Task Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col">
              <Label className="text-sm text-gray-700">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 w-fit bg-black text-white text-xs border-none focus:ring-0">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="On Progress">On Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col">
              <Label className="text-sm text-gray-700">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-xs bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MM/dd/yy")} →{" "}
                          {format(dateRange.to, "MM/dd/yy")}
                        </>
                      ) : (
                        format(dateRange.from, "MM/dd/yy")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col">
              <Label className="text-sm text-gray-700">Assignee</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="" alt="AB" />
                      <AvatarFallback>{assignee}</AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40">
                  <div className="flex flex-col gap-2">
                    {["AB", "CD", "EF"].map((name) => (
                      <Button
                        key={name}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => setAssignee(name)}
                      >
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>{name}</AvatarFallback>
                        </Avatar>
                        {name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-600" />
            <div className="flex flex-col">
              <Label className="text-sm text-gray-700">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-8 w-fit text-xs bg-gray-800 text-white border-none focus:ring-0">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <Textarea
            placeholder="Add Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] bg-gray-100 border border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500 text-sm"
          />
        </div>

        {/* Notes */}
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-800">Notes</Label>
          <Input
            placeholder="Add note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 bg-gray-100 border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>

        {/* Attachments */}
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-800">Attachments</Label>
          <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md mt-1 px-3 py-2">
            <span className="text-gray-600 text-sm italic">
              {task.attachments?.length
                ? `${task.attachments.length} file(s) uploaded`
                : "No attachments"}
            </span>
            <Button variant="link" className="text-sm font-medium">
              <Paperclip className="w-4 h-4 mr-1" /> Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
