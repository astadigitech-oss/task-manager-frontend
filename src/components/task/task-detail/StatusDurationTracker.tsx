"use client";

import { useMemo, useEffect, useState } from "react";
import { Clock, ArrowRight, CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { TaskApi } from "@/types/api/task.api";
import type { StatusDurationData } from "@/types/api/task.api";
import { statusConfig } from "@/constants/task";
import {
    formatStatusDuration,
    getLiveStatusDuration,
    getStatusTotalDuration,
} from "@/lib/mapper/task.mapper";

// Urutan flow status yang diharapkan
const STATUS_ORDER = ["on_board", "on_progress", "done", "canceled"] as const;

interface StatusDurationTrackerProps {
    task: TaskApi;
}

export function StatusDurationTracker({ task }: StatusDurationTrackerProps) {
    // Live ticker — update tiap menit untuk status aktif
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60_000);
        return () => clearInterval(interval);
    }, []);

    const statusDurations = task.status_durations as Record<string, StatusDurationData> | undefined;

    // Cek apakah ada data sama sekali
    const hasData = useMemo(() => {
        if (!statusDurations) return false;
        return Object.keys(statusDurations).length > 0;
    }, [statusDurations]);

    // Build timeline entries dari status yang sudah pernah dimasuki
    const timeline = useMemo(() => {
        return STATUS_ORDER.map((status) => {
            const isCurrentStatus = task.status === status;
            const data = (statusDurations as any)?.[status];
            const hasEntered = !!data;

            const totalMinutes = getStatusTotalDuration(
                statusDurations,
                status,
                isCurrentStatus
            );

            return {
                status,
                label: statusConfig[status]?.label ?? status,
                className: statusConfig[status]?.className ?? "",
                hasEntered,
                isCurrentStatus,
                totalMinutes,
                last_entered_at: data?.last_entered_at,
            };
        }).filter(s => s.hasEntered || s.isCurrentStatus);
    }, [task.status, statusDurations, tick]); // tick buat re-render live

    if (!hasData && task.status === "on_board") {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <Timer className="w-3.5 h-3.5" />
                <span>Timer akan mulai saat task berpindah status</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Status Duration
            </Label>

            {/* Timeline strip */}
            <div className="flex items-center gap-1 flex-wrap">
                {timeline.map((entry, idx) => (
                    <div key={entry.status} className="flex items-center gap-1">
                        <div className="flex flex-col items-center gap-1">
                            <Badge
                                variant="outline"
                                className={`
                                    text-xs px-2 py-0.5
                                    ${entry.className}
                                    ${entry.isCurrentStatus
                                        ? "ring-2 ring-offset-1 ring-sky-400"
                                        : "opacity-75"
                                    }
                                `}
                            >
                                {entry.label}
                                {entry.isCurrentStatus && (
                                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                )}
                            </Badge>
                            {entry.totalMinutes > 0 && (
                                <span className={`text-xs font-mono ${entry.isCurrentStatus
                                        ? "text-sky-600 dark:text-sky-400 font-semibold"
                                        : "text-muted-foreground"
                                    }`}>
                                    {formatStatusDuration(entry.totalMinutes)}
                                </span>
                            )}
                        </div>

                        {/* Arrow antara status */}
                        {idx < timeline.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-0 mb-3 shrink-0" />
                        )}
                    </div>
                ))}
            </div>

            {/* Detail per status — tampil jika sudah ada riwayat */}
            {/* {hasData && (
                <div className="grid gap-2">
                    {timeline
                        .filter(e => e.hasEntered)
                        .map(entry => (
                            <div
                                key={entry.status}
                                className={`
                                    flex items-center justify-between
                                    rounded-lg border px-3 py-2 text-sm
                                    ${entry.isCurrentStatus
                                        ? "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800"
                                        : "bg-muted/30"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    {entry.isCurrentStatus
                                        ? <Timer className="w-3.5 h-3.5 text-sky-500" />
                                        : <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    }
                                    <span className="font-medium">{entry.label}</span>
                                    {entry.isCurrentStatus && (
                                        <span className="text-xs text-sky-500">(aktif)</span>
                                    )}
                                </div>
                                <span className={`font-mono text-sm font-semibold ${entry.isCurrentStatus
                                        ? "text-sky-600 dark:text-sky-400"
                                        : "text-foreground"
                                    }`}>
                                    {entry.totalMinutes > 0
                                        ? formatStatusDuration(entry.totalMinutes)
                                        : "< 1m"
                                    }
                                </span>
                            </div>
                        ))
                    }
                </div>
            )} */}
        </div>
    );
}