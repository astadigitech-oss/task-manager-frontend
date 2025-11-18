"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Project } from "@/types/index";

interface ProjectChartProps {
  projects: Project[];
}

const progressColors = {
  notStarted: "#94a3b8",    // Gray - 0%
  justStarted: "#8b5cf6",   // Purple - 1-25%
  inProgress: "#f59e0b",    // Orange - 26-75%
  almostDone: "#3b82f6",    // Blue - 76-99%
  completed: "#10b981",     // Green - 100%
};

export function ProjectChart({ projects }: ProjectChartProps) {
  // Kategorikan project berdasarkan progress
  const notStarted = projects.filter(p => p.progress === 0).length;
  const justStarted = projects.filter(p => p.progress > 0 && p.progress <= 25).length;
  const inProgress = projects.filter(p => p.progress > 25 && p.progress <= 75).length;
  const almostDone = projects.filter(p => p.progress > 75 && p.progress < 100).length;
  const completed = projects.filter(p => p.progress === 100).length;

  const data = [
    { name: "Belum Mulai", value: notStarted, color: progressColors.notStarted },
    { name: "Baru Mulai", value: justStarted, color: progressColors.justStarted },
    { name: "Sedang Berjalan", value: inProgress, color: progressColors.inProgress },
    { name: "Hampir Selesai", value: almostDone, color: progressColors.almostDone },
    { name: "Selesai", value: completed, color: progressColors.completed },
  ];

  return (
    <Card className="p-6 surface-elevated border divider">
      <h3 className="text-lg font-semibold text-foreground mb-6">Status Progress Project</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: 'var(--color-card-foreground)'
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            formatter={(value: number) => [`${value} Project${value !== 1 ? 's' : ''}`, 'Jumlah']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}