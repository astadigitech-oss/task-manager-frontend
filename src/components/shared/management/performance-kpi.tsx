"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/utils"
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Zap,
    Target,
    BarChart3
} from "lucide-react"

interface MemberPerformanceKPI {
    member: string
    role: "admin" | "member"
    metrics: {
        taskCompletionRate: number
        consistencyScore: number
        evidenceCompleteness: number
        onTimeCompletion: number
        overallScore: number
    }
}

interface AdminPerformanceKPI {
    admin: string
    metrics: {
        taskDistributionEfficiency: number
        approvalRate: number
        taskSuccessRate: number
        overallScore: number
    }
}

// Mock data - in production this would come from an API
const memberKPIData: MemberPerformanceKPI[] = [
    {
        member: "John Doe",
        role: "member",
        metrics: {
            taskCompletionRate: 87,
            consistencyScore: 92,
            evidenceCompleteness: 95,
            onTimeCompletion: 85,
            overallScore: 89.75
        }
    },
    {
        member: "Mike Johnson",
        role: "member",
        metrics: {
            taskCompletionRate: 92,
            consistencyScore: 88,
            evidenceCompleteness: 90,
            onTimeCompletion: 91,
            overallScore: 90.25
        }
    }
]

const adminKPIData: AdminPerformanceKPI[] = [
    {
        admin: "Jane Smith",
        metrics: {
            taskDistributionEfficiency: 88,
            approvalRate: 95,
            taskSuccessRate: 92,
            overallScore: 91.67
        }
    }
]

function getScoreColor(score: number): string {
    if (score >= 90) return "text-success"
    if (score >= 80) return "text-chart-2"
    if (score >= 70) return "text-warning"
    return "text-destructive"
}

function getScoreBgColor(score: number): string {
    if (score >= 90) return "bg-success/10"
    if (score >= 80) return "bg-chart-2/10"
    if (score >= 70) return "bg-warning/10"
    return "bg-destructive/10"
}

export function PerformanceKPI() {
    return (
        <div className="space-y-6">
            {/* Member Performance KPIs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Member Performance KPI
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {memberKPIData.map((member) => (
                            <div key={member.member} className="border border-border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{member.member}</h4>
                                    <div className={cn("px-3 py-1 rounded-full font-semibold text-sm", getScoreBgColor(member.metrics.overallScore))}>
                                        <span className={getScoreColor(member.metrics.overallScore)}>
                                            {member.metrics.overallScore}%
                                        </span>
                                    </div>
                                </div>

                                {/* KPI Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span className="text-xs text-muted-foreground">Completion</span>
                                        </div>
                                        <p className="font-semibold text-lg">{member.metrics.taskCompletionRate}%</p>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap className="w-4 h-4 text-chart-2" />
                                            <span className="text-xs text-muted-foreground">Consistency</span>
                                        </div>
                                        <p className="font-semibold text-lg">{member.metrics.consistencyScore}%</p>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-chart-4" />
                                            <span className="text-xs text-muted-foreground">Evidence</span>
                                        </div>
                                        <p className="font-semibold text-lg">{member.metrics.evidenceCompleteness}%</p>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-warning" />
                                            <span className="text-xs text-muted-foreground">On-Time</span>
                                        </div>
                                        <p className="font-semibold text-lg">{member.metrics.onTimeCompletion}%</p>
                                    </div>
                                </div>

                                {/* Progress Bars */}
                                <div className="space-y-2 pt-2">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium">Overall Performance</span>
                                            <span className="text-xs text-muted-foreground">{member.metrics.overallScore.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full bg-primary transition-all", {
                                                    "bg-success": member.metrics.overallScore >= 90,
                                                    "bg-chart-2": member.metrics.overallScore >= 80,
                                                    "bg-warning": member.metrics.overallScore >= 70
                                                })}
                                                style={{ width: `${member.metrics.overallScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Admin Performance KPIs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Admin Performance KPI
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {adminKPIData.map((admin) => (
                            <div key={admin.admin} className="border border-border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{admin.admin}</h4>
                                    <div className={cn("px-3 py-1 rounded-full font-semibold text-sm", getScoreBgColor(admin.metrics.overallScore))}>
                                        <span className={getScoreColor(admin.metrics.overallScore)}>
                                            {admin.metrics.overallScore.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                {/* KPI Metrics Grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-primary" />
                                            <span className="text-xs text-muted-foreground">Distribution</span>
                                        </div>
                                        <p className="font-semibold text-lg">{admin.metrics.taskDistributionEfficiency}%</p>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-4 h-4 text-chart-2" />
                                            <span className="text-xs text-muted-foreground">Approval</span>
                                        </div>
                                        <p className="font-semibold text-lg">{admin.metrics.approvalRate}%</p>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-chart-4" />
                                            <span className="text-xs text-muted-foreground">Success Rate</span>
                                        </div>
                                        <p className="font-semibold text-lg">{admin.metrics.taskSuccessRate}%</p>
                                    </div>
                                </div>

                                {/* Progress Bars */}
                                <div className="space-y-2 pt-2">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium">Overall Management Performance</span>
                                            <span className="text-xs text-muted-foreground">{admin.metrics.overallScore.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full bg-primary transition-all", {
                                                    "bg-success": admin.metrics.overallScore >= 90,
                                                    "bg-chart-2": admin.metrics.overallScore >= 80,
                                                    "bg-warning": admin.metrics.overallScore >= 70
                                                })}
                                                style={{ width: `${admin.metrics.overallScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
