"use client";

import ProjectCard from "@/components/shared/ProjectsCard"
import { projects } from "@/lib/dummyData"
import { Card } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">

      <div className="w-full bg-gray-50">

       <main className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Projects Overview</h2>
        </div>

        <section className="mb-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} {...p} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-6">
          <Card className="col-span-2 p-6 flex flex-col items-center justify-center h-[300px]">
            <h2 className="font-semibold mb-2">Task Done</h2>
            <p className="text-gray-500 mb-4">Daily • Weekly • Monthly</p>
            <div className="text-3xl font-bold text-gray-400">[ Grafik Chart Dummy ]</div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center">
            <h2 className="font-semibold mb-2">Task Statistic Review</h2>
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="font-bold text-sm">Pie Chart</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div>On Board<br/>2</div>
              <div>On Progress<br/>3</div>
              <div>Pending<br/>2</div>
              <div>Canceled<br/>2</div>
              <div>Done<br/>3</div>
            </div>
          </Card>
        </section>
      </main>
      </div>
    </div>
  )
}
