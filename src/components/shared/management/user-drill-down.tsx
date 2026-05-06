'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChevronRight } from "lucide-react"

interface UserDetail {
    id: string
    name: string
    role: "member" | "admin"
    completionRate: number
    activityBreakdown: Array<{ name: string; value: number }>
    taskStatus: Array<{ status: string; count: number }>
    averageScore: number
    streak: number
}

const mockUsers: UserDetail[] = [
    {
        id: "1",
        name: "Sarah Johnson",
        role: "member",
        completionRate: 92,
        averageScore: 94,
        streak: 15,
        activityBreakdown: [
            { name: "Before Photo", value: 45 },
            { name: "After Photo", value: 42 },
            { name: "Both", value: 13 },
        ],
        taskStatus: [
            { status: "Completed", count: 23 },
            { status: "In Progress", count: 2 },
            { status: "Pending", count: 1 },
        ],
    },
    {
        id: "2",
        name: "Alex Chen",
        role: "member",
        completionRate: 85,
        averageScore: 85,
        streak: 8,
        activityBreakdown: [
            { name: "Before Photo", value: 38 },
            { name: "After Photo", value: 35 },
            { name: "Both", value: 27 },
        ],
        taskStatus: [
            { status: "Completed", count: 18 },
            { status: "In Progress", count: 3 },
            { status: "Pending", count: 2 },
        ],
    },
    {
        id: "3",
        name: "Mike Chen",
        role: "member",
        completionRate: 52,
        averageScore: 52,
        streak: 2,
        activityBreakdown: [
            { name: "Before Photo", value: 28 },
            { name: "After Photo", value: 24 },
            { name: "Both", value: 48 },
        ],
        taskStatus: [
            { status: "Completed", count: 8 },
            { status: "In Progress", count: 5 },
            { status: "Pending", count: 10 },
        ],
    },
]

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"]

export function UserDrillDown() {
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)

    return (
        <>
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>User Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {mockUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="p-4 border border-border/50 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors flex items-center justify-between group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-sm">{user.name}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground capitalize">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Completion Rate</p>
                                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-chart-1"
                                                    style={{ width: `${user.completionRate}%` }}
                                                />
                                            </div>
                                            <p className="font-semibold mt-1">{user.completionRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Score</p>
                                            <p className="text-lg font-bold text-chart-1">{user.averageScore}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Streak</p>
                                            <p className="text-lg font-bold text-chart-2">{user.streak} days</p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* User Detail Modal */}
            {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedUser.name}
                                <span className="text-sm font-normal text-muted-foreground ml-2 capitalize">
                                    ({selectedUser.role})
                                </span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-3 gap-4 py-4">
                            <Card className="border-border/50">
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                                        <p className="text-3xl font-bold text-chart-1">{selectedUser.completionRate}%</p>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-chart-1"
                                                style={{ width: `${selectedUser.completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50">
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Average Score</p>
                                        <p className="text-3xl font-bold text-chart-1">{selectedUser.averageScore}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50">
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Current Streak</p>
                                        <p className="text-3xl font-bold text-chart-2">{selectedUser.streak}</p>
                                        <p className="text-xs text-muted-foreground">consecutive days</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue="activity" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="activity">Activity Breakdown</TabsTrigger>
                                <TabsTrigger value="status">Task Status</TabsTrigger>
                            </TabsList>

                            <TabsContent value="activity">
                                <div className="space-y-4">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={selectedUser.activityBreakdown}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                                                <YAxis stroke="var(--color-muted-foreground)" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "var(--color-card)",
                                                        border: `1px solid var(--color-border)`,
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                                <Bar dataKey="value" fill="var(--color-chart-1)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedUser.activityBreakdown.map((activity, idx) => (
                                            <Card key={idx} className="border-border/50">
                                                <CardContent className="pt-6">
                                                    <p className="text-sm text-muted-foreground mb-2">{activity.name}</p>
                                                    <p className="text-2xl font-bold">{activity.value}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="status">
                                <div className="space-y-4">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={selectedUser.taskStatus}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ status, count }) => `${status}: ${count}`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                >
                                                    {selectedUser.taskStatus.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "var(--color-card)",
                                                        border: `1px solid var(--color-border)`,
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedUser.taskStatus.map((status, idx) => (
                                            <Card key={idx} className="border-border/50">
                                                <CardContent className="pt-6">
                                                    <p className="text-sm text-muted-foreground mb-2">{status.status}</p>
                                                    <p className="text-2xl font-bold">{status.count}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
