"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface Task {
    id: string
    title: string
    assignee: {
        name: string
        avatar: string
        initials: string
    }
    priority: "high" | "medium" | "low"
    status: "pending" | "in-progress" | "completed"
    dueDate: string
    progress: number
}

const tasks: Task[] = [
    {
        id: "1",
        title: "Design system documentation",
        assignee: { name: "Sarah Chen", avatar: "", initials: "SC" },
        priority: "high",
        status: "in-progress",
        dueDate: "Apr 28, 2026",
        progress: 65
    },
    {
        id: "2",
        title: "API endpoint optimization",
        assignee: { name: "Marcus Johnson", avatar: "", initials: "MJ" },
        priority: "medium",
        status: "completed",
        dueDate: "Apr 25, 2026",
        progress: 100
    },
    {
        id: "3",
        title: "User authentication flow",
        assignee: { name: "Emily Rodriguez", avatar: "", initials: "ER" },
        priority: "high",
        status: "pending",
        dueDate: "Apr 30, 2026",
        progress: 0
    },
    {
        id: "4",
        title: "Dashboard analytics widgets",
        assignee: { name: "David Kim", avatar: "", initials: "DK" },
        priority: "low",
        status: "in-progress",
        dueDate: "May 2, 2026",
        progress: 40
    },
    {
        id: "5",
        title: "Mobile responsive layouts",
        assignee: { name: "Anna Thompson", avatar: "", initials: "AT" },
        priority: "medium",
        status: "in-progress",
        dueDate: "May 1, 2026",
        progress: 80
    }
]

const statusConfig = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    "in-progress": { label: "In Progress", className: "bg-primary/10 text-primary" },
    completed: { label: "Completed", className: "bg-success/10 text-success" }
}

const priorityConfig = {
    high: { label: "High", className: "bg-destructive/10 text-destructive" },
    medium: { label: "Medium", className: "bg-warning/10 text-warning-foreground" },
    low: { label: "Low", className: "bg-muted text-muted-foreground" }
}

export function TaskTable() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Task Progress</CardTitle>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                        {tasks.length} tasks
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="w-[120px]">Progress</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id} className="group">
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={task.assignee.avatar} />
                                            <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={cn("font-normal", priorityConfig[task.priority].className)}>
                                        {priorityConfig[task.priority].label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={cn("font-normal", statusConfig[task.status].className)}>
                                        {statusConfig[task.status].label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all",
                                                    task.progress === 100 ? "bg-success" : "bg-primary"
                                                )}
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-8">{task.progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit task
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
