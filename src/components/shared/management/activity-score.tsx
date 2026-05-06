"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/utils"
import {
    Upload,
    CheckCircle2,
    FileCheck,
    Plus,
    TrendingUp
} from "lucide-react"

interface ActivityEvent {
    id: string
    member: string
    role: "admin" | "member"
    activity: "upload_before" | "upload_after" | "both_upload" | "approval"
    points: number
    timestamp: Date
}

// Mock data - in production this would come from an API
const activityEvents: ActivityEvent[] = [
    {
        id: "1",
        member: "John Doe",
        role: "member",
        activity: "upload_before",
        points: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: "2",
        member: "Jane Smith",
        role: "admin",
        activity: "approval",
        points: 1,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
        id: "3",
        member: "John Doe",
        role: "member",
        activity: "both_upload",
        points: 2,
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
        id: "4",
        member: "Mike Johnson",
        role: "member",
        activity: "upload_after",
        points: 1,
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
        id: "5",
        member: "Jane Smith",
        role: "admin",
        activity: "approval",
        points: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
]

interface ActivityScoreData {
    member: string
    role: "admin" | "member"
    totalPoints: number
    activities: {
        uploadBefore: number
        uploadAfter: number
        bothUpload: number
        approval: number
    }
}

// Calculate activity scores
function calculateActivityScores(): Map<string, ActivityScoreData> {
    const scoreMap = new Map<string, ActivityScoreData>()

    activityEvents.forEach((event) => {
        const key = event.member
        if (!scoreMap.has(key)) {
            scoreMap.set(key, {
                member: event.member,
                role: event.role,
                totalPoints: 0,
                activities: {
                    uploadBefore: 0,
                    uploadAfter: 0,
                    bothUpload: 0,
                    approval: 0
                }
            })
        }

        const data = scoreMap.get(key)!
        data.totalPoints += event.points

        if (event.activity === "upload_before") data.activities.uploadBefore += 1
        if (event.activity === "upload_after") data.activities.uploadAfter += 1
        if (event.activity === "both_upload") data.activities.bothUpload += 1
        if (event.activity === "approval") data.activities.approval += 1
    })

    return scoreMap
}

function getActivityLabel(activity: ActivityEvent["activity"]): string {
    const labels = {
        upload_before: "Before Upload",
        upload_after: "After Upload",
        both_upload: "Both Before & After",
        approval: "Task Approval"
    }
    return labels[activity]
}

function getActivityIcon(activity: ActivityEvent["activity"]) {
    const icons = {
        upload_before: Upload,
        upload_after: Upload,
        both_upload: FileCheck,
        approval: CheckCircle2
    }
    return icons[activity]
}

export function ActivityScore() {
    const activityScores = calculateActivityScores()
    const sortedScores = Array.from(activityScores.values()).sort(
        (a, b) => b.totalPoints - a.totalPoints
    )

    const recentActivities = activityEvents.slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Raw Points Activity Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Activity Score (Raw Points)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Activity Points Ledger */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <h4 className="font-medium text-sm">Point System:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Upload Before</span>
                                    <Badge variant="outline">+1 pt</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Upload After</span>
                                    <Badge variant="outline">+1 pt</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Both Before & After</span>
                                    <Badge className="bg-success/20 text-success">+2 pts</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Admin Approval</span>
                                    <Badge variant="outline">+1 pt</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Member Activity Scores */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Member Activity Summary:</h4>
                            {sortedScores.map((score, idx) => (
                                <div key={score.member} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="text-sm font-medium">
                                            <span className="text-lg font-bold text-primary">#{idx + 1}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{score.member}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {score.activities.bothUpload} both • {score.activities.uploadBefore} before • {score.activities.uploadAfter} after
                                                {score.role === "admin" && ` • ${score.activities.approval} approvals`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-primary/20 text-primary">{score.totalPoints} pts</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Recent Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {recentActivities.map((event) => {
                            const Icon = getActivityIcon(event.activity)
                            return (
                                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{event.member}</p>
                                            <p className="text-xs text-muted-foreground">{getActivityLabel(event.activity)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary" className="text-xs">+{event.points} pt</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
