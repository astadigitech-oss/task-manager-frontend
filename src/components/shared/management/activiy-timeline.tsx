"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils/utils"
import {
    CheckCircle2,
    UserPlus,
    MessageSquare,
    FileEdit,
    AlertCircle,
    Clock,
    Sparkles
} from "lucide-react"

interface Activity {
    id: string
    type: "task_completed" | "task_assigned" | "comment" | "task_updated" | "task_overdue" | "task_created"
    user: {
        name: string
        avatar: string
        initials: string
        role: "admin" | "member"
    }
    content: string
    target?: string
    time: string
}

const activities: Activity[] = [
    {
        id: "1",
        type: "task_completed",
        user: { name: "Sarah Chen", avatar: "", initials: "SC", role: "member" },
        content: "completed",
        target: "Design system documentation",
        time: "2 minutes ago"
    },
    {
        id: "2",
        type: "task_assigned",
        user: { name: "John Doe", avatar: "https://github.com/shadcn.png", initials: "JD", role: "admin" },
        content: "assigned a task to",
        target: "Marcus Johnson",
        time: "15 minutes ago"
    },
    {
        id: "3",
        type: "comment",
        user: { name: "Emily Rodriguez", avatar: "", initials: "ER", role: "member" },
        content: "commented on",
        target: "API endpoint optimization",
        time: "1 hour ago"
    },
    {
        id: "4",
        type: "task_updated",
        user: { name: "David Kim", avatar: "", initials: "DK", role: "member" },
        content: "updated progress on",
        target: "Dashboard analytics widgets",
        time: "2 hours ago"
    },
    {
        id: "5",
        type: "task_overdue",
        user: { name: "System", avatar: "", initials: "SY", role: "admin" },
        content: "marked as overdue:",
        target: "Mobile responsive layouts",
        time: "3 hours ago"
    },
    {
        id: "6",
        type: "task_created",
        user: { name: "John Doe", avatar: "https://github.com/shadcn.png", initials: "JD", role: "admin" },
        content: "created new task",
        target: "User authentication flow",
        time: "5 hours ago"
    },
    {
        id: "7",
        type: "task_completed",
        user: { name: "Anna Thompson", avatar: "", initials: "AT", role: "member" },
        content: "completed",
        target: "Landing page redesign",
        time: "Yesterday"
    },
    {
        id: "8",
        type: "comment",
        user: { name: "Marcus Johnson", avatar: "", initials: "MJ", role: "member" },
        content: "replied to comment on",
        target: "Database optimization",
        time: "Yesterday"
    }
]

const activityIcons = {
    task_completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    task_assigned: { icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
    comment: { icon: MessageSquare, color: "text-chart-2", bg: "bg-chart-2/10" },
    task_updated: { icon: FileEdit, color: "text-chart-4", bg: "bg-chart-4/10" },
    task_overdue: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
    task_created: { icon: Sparkles, color: "text-primary", bg: "bg-primary/10" }
}

export function ActivityTimeline() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                </CardTitle>
                <Badge variant="outline" className="font-normal">
                    Live
                    <span className="ml-1.5 w-2 h-2 bg-success rounded-full animate-pulse" />
                </Badge>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-1">
                        {activities.map((activity, index) => {
                            const { icon: Icon, color, bg } = activityIcons[activity.type]
                            return (
                                <div key={activity.id} className="relative flex gap-4 pb-6">
                                    {/* Connector line */}
                                    {index < activities.length - 1 && (
                                        <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)] bg-border" />
                                    )}

                                    {/* Icon */}
                                    <div className={cn("shrink-0 w-10 h-10 rounded-full flex items-center justify-center", bg)}>
                                        <Icon className={cn("w-5 h-5", color)} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-start gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={activity.user.avatar} />
                                                    <AvatarFallback className="text-[10px]">{activity.user.initials}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm">{activity.user.name}</span>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                                                    {activity.user.role}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {activity.content}{" "}
                                            {activity.target && (
                                                <span className="font-medium text-foreground">{activity.target}</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
