"use client";

import { useState } from "react"
import Footer from "@/components/layout/member/Footer"
import Header from "@/components/layout/member/Header"
import Sidebar from "@/components/layout/member/Sidebar"

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? "ml-0" : "ml-0"} 
          md:ml-64
        `}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
