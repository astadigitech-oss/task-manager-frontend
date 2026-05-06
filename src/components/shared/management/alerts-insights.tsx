'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingDown, Clock, AlertCircle } from "lucide-react"

interface Alert {
    id: string
    type: "performance_drop" | "pending_tasks" | "deadline_risk" | "low_activity"
    severity: "critical" | "warning" | "info"
    title: string
    description: string
    user?: string
    value?: number
    action?: string
}

const mockAlerts: Alert[] = [
    {
        id: "1",
        type: "performance_drop",
        severity: "critical",
        title: "Performance Drop Alert",
        description: "Mike Chen's performance dropped 20% this week",
        user: "Mike Chen",
        value: -20,
        action: "Review recent activities and provide support",
    },
    {
        id: "2",
        type: "pending_tasks",
        severity: "warning",
        title: "Pending Tasks Alert",
        description: "8 tasks are pending completion in Project X",
        value: 8,
        action: "Check task assignments and deadlines",
    },
    {
        id: "3",
        type: "deadline_risk",
        severity: "warning",
        title: "Deadline Risk",
        description: "5 tasks approaching deadline within 2 days",
        value: 5,
        action: "Monitor task progress closely",
    },
    {
        id: "4",
        type: "low_activity",
        severity: "info",
        title: "Low Activity Detected",
        description: "Jessica Lee has no activities recorded in the last 3 days",
        user: "Jessica Lee",
        action: "Check in with team member",
    },
]

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case "critical":
            return "border-destructive/50 bg-destructive/5"
        case "warning":
            return "border-warning/50 bg-warning/5"
        default:
            return "border-border/50 bg-secondary/20"
    }
}

const getSeverityIcon = (severity: string) => {
    switch (severity) {
        case "critical":
            return <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        case "warning":
            return <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
        default:
            return <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    }
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case "performance_drop":
            return <TrendingDown className="w-4 h-4" />
        case "pending_tasks":
            return <Clock className="w-4 h-4" />
        case "deadline_risk":
            return <AlertTriangle className="w-4 h-4" />
        default:
            return <AlertCircle className="w-4 h-4" />
    }
}

export function AlertsInsights() {
    const criticalAlerts = mockAlerts.filter((a) => a.severity === "critical")
    const warningAlerts = mockAlerts.filter((a) => a.severity === "warning")

    return (
        <div className="space-y-4">
            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Critical Alerts</p>
                            <p className="text-2xl font-bold text-destructive">{criticalAlerts.length}</p>
                            <p className="text-xs text-muted-foreground">Immediate action required</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Warnings</p>
                            <p className="text-2xl font-bold text-warning">{warningAlerts.length}</p>
                            <p className="text-xs text-muted-foreground">Review recommended</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Alerts</p>
                            <p className="text-2xl font-bold text-foreground">{mockAlerts.length}</p>
                            <p className="text-xs text-muted-foreground">This period</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts List */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg">Alerts & Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {mockAlerts.length > 0 ? (
                        <div className="space-y-3">
                            {mockAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 border rounded-lg space-y-2 ${getSeverityColor(alert.severity)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getSeverityIcon(alert.severity)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-sm">{alert.title}</h4>
                                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-background/50">
                                                    {getTypeIcon(alert.type)}
                                                    <span className="capitalize">{alert.type.replace(/_/g, " ")}</span>
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                                            {alert.action && (
                                                <p className="text-xs text-foreground font-medium bg-background/30 px-2 py-1 rounded inline-block">
                                                    {alert.action}
                                                </p>
                                            )}
                                        </div>
                                        {alert.value !== undefined && (
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-lg font-bold ${alert.value < 0 ? "text-destructive" : "text-warning"}`}>
                                                    {alert.value > 0 ? "+" : ""}{alert.value}
                                                    {alert.type === "performance_drop" ? "%" : ""}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No alerts at this moment</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
