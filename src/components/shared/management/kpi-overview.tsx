'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Trophy, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface KPIOverviewMetrics {
    averageScore: number
    totalActiveUsers: number
    topPerformerName: string
    topPerformerScore: number
    underperformerAlert: {
        name: string
        performance: number
        change: number
    } | null
}

const mockMetrics: KPIOverviewMetrics = {
    averageScore: 78.5,
    totalActiveUsers: 12,
    topPerformerName: "Sarah Johnson",
    topPerformerScore: 94,
    underperformerAlert: {
        name: "Mike Chen",
        performance: 52,
        change: -18,
    },
}

export function KPIOverview() {
    const getColorClass = (score: number) => {
        if (score >= 90) return "bg-success"
        if (score >= 80) return "bg-chart-1"
        if (score >= 70) return "bg-warning"
        return "bg-destructive"
    }

    const getStatusColor = (score: number) => {
        if (score >= 90) return "text-success"
        if (score >= 80) return "text-chart-1"
        if (score >= 70) return "text-warning"
        return "text-destructive"
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average KPI Score */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Average KPI Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className={`text-3xl font-bold ${getStatusColor(mockMetrics.averageScore)}`}>
                            {mockMetrics.averageScore.toFixed(1)}
                        </span>
                        <TrendingUp className={`w-5 h-5 ${getStatusColor(mockMetrics.averageScore)}`} />
                    </div>
                    <Progress value={mockMetrics.averageScore} className="h-2" />
                    <p className="text-xs text-muted-foreground">Team performance this period</p>
                </CardContent>
            </Card>

            {/* Total Active Users */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Active Users
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-chart-1">{mockMetrics.totalActiveUsers}</span>
                        <Users className="w-5 h-5 text-chart-1" />
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div
                            className="bg-chart-1 h-2 rounded-full"
                            style={{ width: `${(mockMetrics.totalActiveUsers / 15) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">12 out of 15 members</p>
                </CardContent>
            </Card>

            {/* Top Performer */}
            <Card className="border-border/50 border-success/30 bg-success/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Top Performer
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-sm">{mockMetrics.topPerformerName}</p>
                            <p className="text-xs text-muted-foreground">This week</p>
                        </div>
                        <Trophy className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-success">{mockMetrics.topPerformerScore}</span>
                        <span className="text-xs text-success">+12 vs last week</span>
                    </div>
                </CardContent>
            </Card>

            {/* Underperformer Alert */}
            {mockMetrics.underperformerAlert && (
                <Card className="border-border/50 border-warning/30 bg-warning/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{mockMetrics.underperformerAlert.name}</p>
                                <p className="text-xs text-muted-foreground">Underperforming</p>
                            </div>
                            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-warning">
                                {mockMetrics.underperformerAlert.performance}
                            </span>
                            <span className="text-xs text-destructive">
                                {mockMetrics.underperformerAlert.change}% vs last week
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
