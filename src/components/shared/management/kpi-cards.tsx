"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils/utils"
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"

interface KPIData {
    title: string
    value: string | number
    change: number
    changeLabel: string
    icon: React.ElementType
    iconColor: string
    iconBg: string
}

const kpiData: KPIData[] = [
    {
        title: "Task Completion Rate",
        value: "87%",
        change: 12,
        changeLabel: "vs last week",
        icon: CheckCircle2,
        iconColor: "text-success",
        iconBg: "bg-success/10"
    },
    {
        title: "Active Tasks",
        value: 42,
        change: 8,
        changeLabel: "new this week",
        icon: Clock,
        iconColor: "text-primary",
        iconBg: "bg-primary/10"
    },
    {
        title: "Overdue Tasks",
        value: 5,
        change: -3,
        changeLabel: "vs last week",
        icon: AlertTriangle,
        iconColor: "text-warning",
        iconBg: "bg-warning/10"
    },
    {
        title: "Productivity Score",
        value: "94",
        change: 5,
        changeLabel: "vs last month",
        icon: TrendingUp,
        iconColor: "text-chart-2",
        iconBg: "bg-chart-2/10"
    }
]

export function KPICards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi) => (
                <Card key={kpi.title} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                                <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                                <div className="flex items-center gap-1.5">
                                    {kpi.change > 0 ? (
                                        <ArrowUpRight className="w-4 h-4 text-success" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                                    )}
                                    <span className={cn(
                                        "text-sm font-medium",
                                        kpi.change > 0 ? "text-success" : "text-destructive"
                                    )}>
                                        {Math.abs(kpi.change)}%
                                    </span>
                                    <span className="text-sm text-muted-foreground">{kpi.changeLabel}</span>
                                </div>
                            </div>
                            <div className={cn("p-3 rounded-xl", kpi.iconBg)}>
                                <kpi.icon className={cn("w-6 h-6", kpi.iconColor)} />
                            </div>
                        </div>
                    </CardContent>
                    {/* Decorative gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
            ))}
        </div>
    )
}
