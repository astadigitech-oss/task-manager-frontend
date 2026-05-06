"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    RadialBarChart,
    RadialBar,
} from "recharts"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Crown,
    Target,
    Zap,
    Calendar,
    CalendarDays,
    CalendarRange,
    CheckCircle2,
    Clock,
    Star,
    Trophy
} from "lucide-react"
import { cn } from "@/lib/utils/utils"

// Team members data
const teamMembers = [
    {
        id: "admin-1",
        name: "Sarah Chen",
        role: "admin",
        avatar: "/avatars/sarah.jpg",
        color: "var(--chart-1)"
    },
    {
        id: "admin-2",
        name: "Marcus Kim",
        role: "admin",
        avatar: "/avatars/marcus.jpg",
        color: "var(--chart-2)"
    },
    {
        id: "member-1",
        name: "Emily Davis",
        role: "member",
        avatar: "/avatars/emily.jpg",
        color: "var(--chart-3)"
    },
    {
        id: "member-2",
        name: "David Park",
        role: "member",
        avatar: "/avatars/david.jpg",
        color: "var(--chart-4)"
    },
    {
        id: "member-3",
        name: "Anna Lopez",
        role: "member",
        avatar: "/avatars/anna.jpg",
        color: "var(--chart-5)"
    },
]

// Daily task data (last 7 days)
const dailytaskData = [
    {
        period: "Mon",
        "admin-1": 15, "admin-2": 12,
        "member-1": 10, "member-2": 8, "member-3": 11,
    },
    {
        period: "Tue",
        "admin-1": 18, "admin-2": 14,
        "member-1": 12, "member-2": 10, "member-3": 13,
    },
    {
        period: "Wed",
        "admin-1": 12, "admin-2": 16,
        "member-1": 14, "member-2": 12, "member-3": 10,
    },
    {
        period: "Thu",
        "admin-1": 20, "admin-2": 18,
        "member-1": 15, "member-2": 14, "member-3": 16,
    },
    {
        period: "Fri",
        "admin-1": 16, "admin-2": 15,
        "member-1": 11, "member-2": 10, "member-3": 12,
    },
    {
        period: "Sat",
        "admin-1": 8, "admin-2": 6,
        "member-1": 5, "member-2": 4, "member-3": 7,
    },
    {
        period: "Sun",
        "admin-1": 5, "admin-2": 4,
        "member-1": 3, "member-2": 2, "member-3": 4,
    },
]

// Weekly task data (last 4 weeks)
const weeklytaskData = [
    {
        period: "Week 1",
        "admin-1": 85, "admin-2": 72,
        "member-1": 65, "member-2": 58, "member-3": 70,
    },
    {
        period: "Week 2",
        "admin-1": 92, "admin-2": 78,
        "member-1": 71, "member-2": 62, "member-3": 68,
    },
    {
        period: "Week 3",
        "admin-1": 78, "admin-2": 85,
        "member-1": 68, "member-2": 75, "member-3": 72,
    },
    {
        period: "Week 4",
        "admin-1": 95, "admin-2": 88,
        "member-1": 82, "member-2": 70, "member-3": 85,
    },
]

// Monthly task data (last 6 months)
const monthlytaskData = [
    {
        period: "Jan",
        "admin-1": 320, "admin-2": 290,
        "member-1": 260, "member-2": 230, "member-3": 275,
    },
    {
        period: "Feb",
        "admin-1": 350, "admin-2": 310,
        "member-1": 280, "member-2": 250, "member-3": 295,
    },
    {
        period: "Mar",
        "admin-1": 380, "admin-2": 340,
        "member-1": 310, "member-2": 280, "member-3": 320,
    },
    {
        period: "Apr",
        "admin-1": 420, "admin-2": 380,
        "member-1": 350, "member-2": 310, "member-3": 365,
    },
    {
        period: "May",
        "admin-1": 450, "admin-2": 410,
        "member-1": 380, "member-2": 340, "member-3": 395,
    },
    {
        period: "Jun",
        "admin-1": 480, "admin-2": 440,
        "member-1": 410, "member-2": 370, "member-3": 425,
    },
]

// task types with targets
const taskTypes = [
    {
        id: "daily-tasks",
        name: "Daily Tasks",
        description: "Complete assigned daily tasks",
        target: 5,
        points: 10,
        icon: CheckCircle2,
        color: "var(--chart-1)"
    },
    {
        id: "urgent-tasks",
        name: "Urgent Priority",
        description: "Complete urgent priority tasks",
        target: 2,
        points: 25,
        icon: Zap,
        color: "var(--chart-5)"
    },
    {
        id: "on-time",
        name: "On-Time Delivery",
        description: "Complete tasks before deadline",
        target: 8,
        points: 15,
        icon: Clock,
        color: "var(--chart-2)"
    },
    {
        id: "streak",
        name: "Daily Streak",
        description: "Maintain daily activity streak",
        target: 7,
        points: 50,
        icon: Star,
        color: "var(--chart-4)"
    },
]

// Team member task progress
const membertaskProgress = [
    {
        memberId: "admin-1",
        tasks: [
            { taskId: "daily-tasks", completed: 5, target: 5 },
            { taskId: "urgent-tasks", completed: 2, target: 2 },
            { taskId: "on-time", completed: 7, target: 8 },
            { taskId: "streak", completed: 7, target: 7 },
        ]
    },
    {
        memberId: "admin-2",
        tasks: [
            { taskId: "daily-tasks", completed: 4, target: 5 },
            { taskId: "urgent-tasks", completed: 1, target: 2 },
            { taskId: "on-time", completed: 6, target: 8 },
            { taskId: "streak", completed: 5, target: 7 },
        ]
    },
    {
        memberId: "member-1",
        tasks: [
            { taskId: "daily-tasks", completed: 5, target: 5 },
            { taskId: "urgent-tasks", completed: 1, target: 2 },
            { taskId: "on-time", completed: 8, target: 8 },
            { taskId: "streak", completed: 6, target: 7 },
        ]
    },
    {
        memberId: "member-2",
        tasks: [
            { taskId: "daily-tasks", completed: 3, target: 5 },
            { taskId: "urgent-tasks", completed: 0, target: 2 },
            { taskId: "on-time", completed: 5, target: 8 },
            { taskId: "streak", completed: 3, target: 7 },
        ]
    },
    {
        memberId: "member-3",
        tasks: [
            { taskId: "daily-tasks", completed: 4, target: 5 },
            { taskId: "urgent-tasks", completed: 2, target: 2 },
            { taskId: "on-time", completed: 7, target: 8 },
            { taskId: "streak", completed: 7, target: 7 },
        ]
    },
]

// Calculate member statistics based on period
const getMemberStats = (memberId: string, data: typeof dailytaskData) => {
    const points = data.map(w => w[memberId as keyof typeof w] as number)
    const total = points.reduce((a, b) => a + b, 0)
    const avg = Math.round(total / points.length)
    const lastPeriod = points[points.length - 1]
    const prevPeriod = points[points.length - 2]
    const change = prevPeriod ? Math.round(((lastPeriod - prevPeriod) / prevPeriod) * 100) : 0
    return { total, avg, lastPeriod, change }
}

// Leaderboard data based on selected period
const getLeaderboard = (data: typeof dailytaskData) => {
    return teamMembers.map(member => ({
        ...member,
        ...getMemberStats(member.id, data)
    })).sort((a, b) => b.total - a.total)
}

type TimePeriod = "daily" | "weekly" | "monthly"

export function TeamPointsChart() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly")
    const [selectedMembers, setSelectedMembers] = useState<string[]>(teamMembers.map(m => m.id))

    const currentData = timePeriod === "daily"
        ? dailytaskData
        : timePeriod === "weekly"
            ? weeklytaskData
            : monthlytaskData

    const leaderboard = getLeaderboard(currentData)

    const periodLabel = timePeriod === "daily" ? "per day" : timePeriod === "weekly" ? "per week" : "per month"
    const periodIcon = timePeriod === "daily" ? Calendar : timePeriod === "weekly" ? CalendarDays : CalendarRange

    const toggleMember = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        )
    }

    // Calculate overall task completion rate
    const overalltaskCompletion = membertaskProgress.reduce((acc, member) => {
        const memberCompletion = member.tasks.reduce((sum, task) => {
            return sum + (task.completed / task.target) * 100
        }, 0) / member.tasks.length
        return acc + memberCompletion
    }, 0) / membertaskProgress.length

    // Radial chart data for task completion
    const radialData = taskTypes.map((task, index) => {
        const totalCompleted = membertaskProgress.reduce((sum, member) => {
            const membertask = member.tasks.find(q => q.taskId === task.id)
            return sum + (membertask ? membertask.completed : 0)
        }, 0)
        const totalTarget = membertaskProgress.length * task.target
        return {
            name: task.name,
            value: Math.round((totalCompleted / totalTarget) * 100),
            fill: task.color,
        }
    })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        task Performance Tracker
                    </CardTitle>
                    <CardDescription>Monitor team points from completed tasks</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border bg-muted p-1">
                        <Button
                            variant={timePeriod === "daily" ? "default" : "ghost"}
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setTimePeriod("daily")}
                        >
                            <Calendar className="h-4 w-4" />
                            Daily
                        </Button>
                        <Button
                            variant={timePeriod === "weekly" ? "default" : "ghost"}
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setTimePeriod("weekly")}
                        >
                            <CalendarDays className="h-4 w-4" />
                            Weekly
                        </Button>
                        <Button
                            variant={timePeriod === "monthly" ? "default" : "ghost"}
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setTimePeriod("monthly")}
                        >
                            <CalendarRange className="h-4 w-4" />
                            Monthly
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="individual" className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                        <TabsTrigger value="individual">Individual</TabsTrigger>
                        <TabsTrigger value="task-progress">task Progress</TabsTrigger>
                        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    </TabsList>

                    {/* Individual Performance Tab */}
                    <TabsContent value="individual" className="space-y-4">
                        {/* Member Filter */}
                        <div className="flex flex-wrap gap-2 pb-2">
                            {teamMembers.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                        selectedMembers.includes(member.id)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: member.color }}
                                    />
                                    {member.name.split(" ")[0]}
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                        {member.role === "admin" ? "A" : "M"}
                                    </Badge>
                                </button>
                            ))}
                        </div>

                        {/* Individual Line Chart */}
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={currentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis
                                        dataKey="period"
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--muted-foreground)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--card)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        }}
                                        labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                        formatter={(value: number, name: string) => {
                                            const member = teamMembers.find(m => m.id === name)
                                            return [
                                                `${value} pts`,
                                                member ? `${member.name} (${member.role})` : name
                                            ]
                                        }}
                                    />
                                    <Legend
                                        formatter={(value) => {
                                            const member = teamMembers.find(m => m.id === value)
                                            return member ? member.name : value
                                        }}
                                    />
                                    {teamMembers
                                        .filter(m => selectedMembers.includes(m.id))
                                        .map(member => (
                                            <Line
                                                key={member.id}
                                                type="monotone"
                                                dataKey={member.id}
                                                stroke={member.color}
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: member.color }}
                                                activeDot={{ r: 6, strokeWidth: 2 }}
                                            />
                                        ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Period Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            {teamMembers.slice(0, 4).map(member => {
                                const stats = getMemberStats(member.id, currentData)
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback className="text-xs">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{member.name.split(" ")[0]}</p>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-muted-foreground">{stats.avg} pts {periodLabel}</span>
                                                {stats.change > 0 ? (
                                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                                ) : stats.change < 0 ? (
                                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* task Progress Tab */}
                    <TabsContent value="task-progress" className="space-y-6">
                        {/* Overall Progress */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* task Types Progress */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active tasks</h3>
                                <div className="grid gap-4">
                                    {taskTypes.map(task => {
                                        const totalCompleted = membertaskProgress.reduce((sum, member) => {
                                            const membertask = member.tasks.find(q => q.taskId === task.id)
                                            return sum + (membertask ? membertask.completed : 0)
                                        }, 0)
                                        const totalTarget = membertaskProgress.length * task.target
                                        const percentage = Math.round((totalCompleted / totalTarget) * 100)
                                        const Icon = task.icon

                                        return (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                                            >
                                                <div
                                                    className="flex items-center justify-center w-12 h-12 rounded-xl"
                                                    style={{ backgroundColor: `color-mix(in oklch, ${task.color} 15%, transparent)` }}
                                                >
                                                    <Icon className="h-6 w-6" style={{ color: task.color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div>
                                                            <p className="font-medium text-foreground">{task.name}</p>
                                                            <p className="text-xs text-muted-foreground">{task.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{task.points} pts
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Progress value={percentage} className="h-2 flex-1" />
                                                        <span className="text-sm font-medium text-muted-foreground w-16 text-right">
                                                            {totalCompleted}/{totalTarget}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Radial Progress Chart */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completion Rate</h3>
                                <div className="flex flex-col items-center justify-center p-6 rounded-xl border bg-card">
                                    <div className="relative h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="30%"
                                                outerRadius="100%"
                                                data={radialData}
                                                startAngle={180}
                                                endAngle={-180}
                                            >
                                                <RadialBar
                                                    background
                                                    dataKey="value"
                                                    cornerRadius={10}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "var(--card)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "8px",
                                                    }}
                                                    formatter={(value: number, name: string) => [`${value}%`, name]}
                                                />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-foreground">{Math.round(overalltaskCompletion)}%</p>
                                                <p className="text-xs text-muted-foreground">Overall</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                                        {radialData.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                                <span className="text-muted-foreground truncate">{item.name}</span>
                                                <span className="font-medium ml-auto">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team Member task Status */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Team task Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {teamMembers.map(member => {
                                    const memberProgress = membertaskProgress.find(m => m.memberId === member.id)
                                    const completedtasks = memberProgress?.tasks.filter(q => q.completed >= q.target).length || 0
                                    const totaltasks = taskTypes.length

                                    return (
                                        <div
                                            key={member.id}
                                            className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{member.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                                                            {member.role === "admin" ? "Admin" : "Member"}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {completedtasks}/{totaltasks} tasks
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {memberProgress?.tasks.map(task => {
                                                    const taskType = taskTypes.find(q => q.id === task.taskId)
                                                    if (!taskType) return null
                                                    const isComplete = task.completed >= task.target
                                                    const percentage = Math.min((task.completed / task.target) * 100, 100)

                                                    return (
                                                        <div key={task.taskId} className="flex items-center gap-2">
                                                            <div
                                                                className={cn(
                                                                    "w-5 h-5 rounded-full flex items-center justify-center",
                                                                    isComplete ? "bg-green-500/20" : "bg-muted"
                                                                )}
                                                            >
                                                                {isComplete ? (
                                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                ) : (
                                                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground flex-1 truncate">
                                                                {taskType.name}
                                                            </span>
                                                            <span className="text-xs font-medium">
                                                                {task.completed}/{task.target}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Leaderboard Tab */}
                    <TabsContent value="leaderboard" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Ranking List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {timePeriod === "daily" ? "Today" : timePeriod === "weekly" ? "This Month" : "This Year"}&apos;s Rankings
                                    </h3>
                                    <Badge variant="outline" className="gap-1">
                                        <Trophy className="h-3 w-3" />
                                        {timePeriod}
                                    </Badge>
                                </div>
                                {leaderboard.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                                            index === 0 ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-muted/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                                            index === 0 ? "bg-primary text-primary-foreground" :
                                                index === 1 ? "bg-muted-foreground/20 text-foreground" :
                                                    index === 2 ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" :
                                                        "bg-muted text-muted-foreground"
                                        )}>
                                            {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                                        </div>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-foreground truncate">{member.name}</p>
                                                <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                                                    {member.role === "admin" ? "Admin" : "Member"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Avg: {member.avg} pts {periodLabel}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-foreground">{member.total} pts</p>
                                            <div className="flex items-center justify-end gap-1">
                                                {member.change > 0 ? (
                                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                                ) : member.change < 0 ? (
                                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                                ) : null}
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    member.change > 0 ? "text-green-500" : member.change < 0 ? "text-red-500" : "text-muted-foreground"
                                                )}>
                                                    {member.change > 0 ? "+" : ""}{member.change}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Points Comparison Bar Chart */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Points Distribution</h3>
                                <div className="h-[380px] p-4 rounded-xl border bg-card">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={leaderboard.map(m => ({
                                                name: m.name.split(" ")[0],
                                                points: m.total,
                                                avg: m.avg,
                                                role: m.role,
                                                color: m.color
                                            }))}
                                            layout="vertical"
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                            <XAxis
                                                type="number"
                                                stroke="var(--muted-foreground)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                stroke="var(--muted-foreground)"
                                                fontSize={12}
                                                width={70}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "var(--card)",
                                                    border: "1px solid var(--border)",
                                                    borderRadius: "8px",
                                                }}
                                                formatter={(value: number) => [`${value} pts`, "Total Points"]}
                                            />
                                            <Bar
                                                dataKey="points"
                                                radius={[0, 6, 6, 0]}
                                                fill="var(--primary)"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
