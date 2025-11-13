"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4">
      {/* Menu button visible only on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <h1 className="text-lg font-semibold">Task Management Dashboard</h1>
      <div className="text-sm text-gray-500">Member</div>
    </header>
  )
}
 