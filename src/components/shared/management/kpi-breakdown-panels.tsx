'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const memberBreakdownData = [
    {
        member: "Sarah Johnson",
        completion: 92,
        onTime: 88,
        consistency: 95,
        evidence: 90,
    },
    {
        member: "Alex Chen",
        completion: 85,
        onTime: 82,
        consistency: 88,
        evidence: 84,
    },
    {
        member: "Emily Davis",
        completion: 78,
        onTime: 75,
        consistency: 80,
        evidence: 76,
    },
]

const adminBreakdownData = [
    {
        admin: "John Admin",
        distribution: 88,
        approval: 92,
        success: 90,
    },
    {
        admin: "Lisa Manager",
        distribution: 82,
        approval: 85,
        success: 87,
    },
]

const trendData = [
    { week: "Week 1", memberAvg: 72, adminAvg: 85 },
    { week: "Week 2", memberAvg: 75, adminAvg: 87 },
    { week: "Week 3", memberAvg: 78, adminAvg: 89 },
    { week: "Week 4", memberAvg: 80, adminAvg: 88 },
]

export function KPIBreakdownPanel() {
    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle>KPI Breakdown & Transparency</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="member" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="member">Member KPI</TabsTrigger>
                        <TabsTrigger value="admin">Admin KPI</TabsTrigger>
                        <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
                    </TabsList>

                    {/* Member KPI Breakdown */}
                    <TabsContent value="member" className="space-y-4">
                        <div className="grid gap-4">
                            {memberBreakdownData.map((member) => (
                                <div
                                    key={member.member}
                                    className="p-4 border border-border/50 rounded-lg space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">{member.member}</h4>
                                        <span className="text-sm font-bold text-chart-1">
                                            {Math.round((member.completion + member.onTime + member.consistency + member.evidence) / 4)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-1"
                                                    style={{ width: `${member.completion}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{member.completion}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">On-Time Delivery</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-2"
                                                    style={{ width: `${member.onTime}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{member.onTime}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Consistency</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-3"
                                                    style={{ width: `${member.consistency}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{member.consistency}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Evidence Quality</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-4"
                                                    style={{ width: `${member.evidence}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{member.evidence}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Admin KPI Breakdown */}
                    <TabsContent value="admin" className="space-y-4">
                        <div className="grid gap-4">
                            {adminBreakdownData.map((admin) => (
                                <div
                                    key={admin.admin}
                                    className="p-4 border border-border/50 rounded-lg space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">{admin.admin}</h4>
                                        <span className="text-sm font-bold text-chart-1">
                                            {Math.round((admin.distribution + admin.approval + admin.success) / 3)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Distribution</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-1"
                                                    style={{ width: `${admin.distribution}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{admin.distribution}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Approval Rate</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-2"
                                                    style={{ width: `${admin.approval}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{admin.approval}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-3"
                                                    style={{ width: `${admin.success}%` }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold mt-1">{admin.success}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Trend Analysis */}
                    <TabsContent value="trend" className="space-y-4">
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                                    <YAxis stroke="var(--color-muted-foreground)" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--color-card)",
                                            border: `1px solid var(--color-border)`,
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="memberAvg"
                                        stroke="var(--color-chart-1)"
                                        strokeWidth={2}
                                        name="Member Average"
                                        dot={{ fill: "var(--color-chart-1)" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="adminAvg"
                                        stroke="var(--color-chart-2)"
                                        strokeWidth={2}
                                        name="Admin Average"
                                        dot={{ fill: "var(--color-chart-2)" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
