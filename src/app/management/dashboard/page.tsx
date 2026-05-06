"use client";

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { KPIOverview } from "@/components/shared/management/kpi-overview";
import { ScoringSystem } from "@/components/shared/management/scoring-system";
import { TeamPointsChart } from "@/components/shared/management/team-points-chart";
import { AlertsInsights } from "@/components/shared/management/alerts-insights";
import { PerformanceCharts } from "@/components/shared/management/performance-charts";
import { TaskTable } from "@/components/shared/management/task-table";
import { ActivityTimeline } from "@/components/shared/management/activiy-timeline";
import { KPIBreakdownPanel } from "@/components/shared/management/kpi-breakdown-panels";
import { UserDrillDown } from "@/components/shared/management/user-drill-down";


export default function Management() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 p-6">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                Management Dashboard
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Management Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here&apos;s what&apos;s happening across all projects.
                    </p>
                </div>
            </div>

            <Separator />

            <div className="max-w-full mx-auto space-y-8">
                {/* 1. KPI Overview (Top Section) */}
                <section>
                    <KPIOverview />
                </section>

                {/* 2. Leaderboard (Gamification Layer) */}
                <section>
                    <ScoringSystem />
                </section>

                {/* 3. Performance Chart */}
                <section>
                    <TeamPointsChart />
                </section>

                {/* 4. User Detail Drill-down */}
                <section>
                    <UserDrillDown />
                </section>

                {/* 5. KPI Breakdown Panel */}
                <section>
                    <KPIBreakdownPanel />
                </section>

                {/* 6. Alerts & Insights */}
                <section>
                    <AlertsInsights />
                </section>

                {/* Additional Charts */}
                <section>
                    <PerformanceCharts />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Task Table */}
                    <div>
                        <TaskTable />
                    </div>

                    {/* Activity Timeline */}
                    <div>
                        <ActivityTimeline />
                    </div>
                </div>
            </div>
        </div>

    );
}