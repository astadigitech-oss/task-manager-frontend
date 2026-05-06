"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
    Area,
    AreaChart,
} from "recharts"

const productivityData = [
    { name: "Mon", tasks: 12, completed: 10 },
    { name: "Tue", tasks: 15, completed: 14 },
    { name: "Wed", tasks: 8, completed: 8 },
    { name: "Thu", tasks: 18, completed: 15 },
    { name: "Fri", tasks: 14, completed: 12 },
    { name: "Sat", tasks: 5, completed: 5 },
    { name: "Sun", tasks: 3, completed: 2 },
]

const memberPerformance = [
    { name: "Sarah", efficiency: 94, tasks: 28 },
    { name: "Marcus", efficiency: 88, tasks: 35 },
    { name: "Emily", efficiency: 92, tasks: 22 },
    { name: "David", efficiency: 85, tasks: 30 },
    { name: "Anna", efficiency: 96, tasks: 18 },
]

const taskDistribution = [
    { name: "Development", value: 35, color: "var(--chart-1)" },
    { name: "Design", value: 25, color: "var(--chart-2)" },
    { name: "Testing", value: 20, color: "var(--chart-3)" },
    { name: "Documentation", value: 12, color: "var(--chart-4)" },
    { name: "Other", value: 8, color: "var(--chart-5)" },
]

const trendData = [
    { date: "Week 1", productivity: 78, target: 80 },
    { date: "Week 2", productivity: 82, target: 80 },
    { date: "Week 3", productivity: 79, target: 82 },
    { date: "Week 4", productivity: 87, target: 82 },
    { date: "Week 5", productivity: 91, target: 85 },
    { date: "Week 6", productivity: 94, target: 85 },
]

export function PerformanceCharts() {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="productivity" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="productivity">Weekly Tasks</TabsTrigger>
                        <TabsTrigger value="members">Team Performance</TabsTrigger>
                        <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
                        <TabsTrigger value="trends">Productivity Trends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="productivity" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="tasks" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Assigned" />
                                <Bar dataKey="completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Completed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="members" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={memberPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={60} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value: number, name: string) => [
                                        name === "efficiency" ? `${value}%` : value,
                                        name === "efficiency" ? "Efficiency" : "Tasks"
                                    ]}
                                />
                                <Bar dataKey="efficiency" fill="var(--chart-1)" radius={[0, 4, 4, 0]} name="Efficiency" />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="distribution" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {taskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="trends" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[70, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="productivity"
                                    stroke="var(--chart-1)"
                                    fill="var(--chart-1)"
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                    name="Productivity"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="var(--chart-5)"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Target"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
