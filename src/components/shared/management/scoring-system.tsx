"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/utils"
import {
    Trophy,
    Flame,
    Star,
    Award,
    TrendingUp,
    Medal
} from "lucide-react"

interface ScoringRecord {
    member: string
    role: "admin" | "member"
    activityScore: number
    performanceScore: number
    bonusMultiplier: number
    totalScore: number
    streak: number
    rank: number
}

// Mock data - in production this would be calculated from activity and performance data
const scoringRecords: ScoringRecord[] = [
    {
        member: "Mike Johnson",
        role: "member",
        activityScore: 45,
        performanceScore: 90.25,
        bonusMultiplier: 1.2,
        totalScore: 162.3,
        streak: 12,
        rank: 1
    },
    {
        member: "John Doe",
        role: "member",
        activityScore: 42,
        performanceScore: 89.75,
        bonusMultiplier: 1.0,
        totalScore: 131.75,
        streak: 8,
        rank: 2
    },
    {
        member: "Jane Smith",
        role: "admin",
        activityScore: 38,
        performanceScore: 91.67,
        bonusMultiplier: 1.15,
        totalScore: 141.47,
        streak: 10,
        rank: 3
    }
]

function getRankIcon(rank: number) {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <Award className="w-5 h-5 text-muted-foreground" />
}

function getTierBadge(score: number): { label: string; color: string } {
    if (score >= 150) return { label: "Diamond", color: "bg-cyan-500/20 text-cyan-700" }
    if (score >= 120) return { label: "Platinum", color: "bg-purple-500/20 text-purple-700" }
    if (score >= 100) return { label: "Gold", color: "bg-yellow-500/20 text-yellow-700" }
    if (score >= 80) return { label: "Silver", color: "bg-gray-500/20 text-gray-700" }
    return { label: "Bronze", color: "bg-orange-500/20 text-orange-700" }
}

export function ScoringSystem() {
    const sortedRecords = [...scoringRecords].sort((a, b) => b.totalScore - a.totalScore)

    return (
        <div className="space-y-6">
            {/* Scoring Formula */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Scoring Formula
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="font-mono text-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-muted-foreground">Total Score =</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                    <div className="text-primary font-medium">
                                        (Activity Score + Performance Score) × Bonus Multiplier
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">BONUS MULTIPLIERS:</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">1-3 days streak</span>
                                        <Badge variant="outline">×1.0</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">4-7 days streak</span>
                                        <Badge className="bg-chart-2/20 text-chart-2">×1.1</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">8-14 days streak</span>
                                        <Badge className="bg-success/20 text-success">×1.2</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">15+ days streak</span>
                                        <Badge className="bg-primary/20 text-primary">×1.5</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        Overall Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {sortedRecords.map((record, idx) => {
                            const tierBadge = getTierBadge(record.totalScore)
                            return (
                                <div key={record.member} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Rank */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                            {getRankIcon(idx + 1)}
                                        </div>

                                        {/* Member Info */}
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{record.member}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {record.role === "admin" ? "Admin" : "Member"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Streak: <span className="font-semibold">{record.streak}d</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scores and Tier */}
                                    <div className="text-right">
                                        <div className="space-y-1">
                                            <p className="text-2xl font-bold text-foreground">
                                                {record.totalScore.toFixed(1)}
                                            </p>
                                            <Badge className={cn("text-xs", tierBadge.color)}>
                                                {tierBadge.label}
                                            </Badge>
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                                            <div>Activity: <span className="font-semibold">{record.activityScore}</span></div>
                                            <div>Performance: <span className="font-semibold">{record.performanceScore.toFixed(1)}</span></div>
                                            <div>Multiplier: <span className="font-semibold">×{record.bonusMultiplier}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Tier System */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Tier System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        {[
                            { label: "Bronze", score: "0-79", color: "bg-orange-500/20 text-orange-700" },
                            { label: "Silver", score: "80-99", color: "bg-gray-500/20 text-gray-700" },
                            { label: "Gold", score: "100-119", color: "bg-yellow-500/20 text-yellow-700" },
                            { label: "Platinum", score: "120-149", color: "bg-purple-500/20 text-purple-700" },
                            { label: "Diamond", score: "150+", color: "bg-cyan-500/20 text-cyan-700" }
                        ].map((tier) => (
                            <div key={tier.label} className={cn("p-3 rounded-lg text-center", tier.color)}>
                                <p className="font-semibold text-sm">{tier.label}</p>
                                <p className="text-xs opacity-75">{tier.score}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
