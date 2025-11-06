"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  List,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  X,
  Folder,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import AddNewWorkspace from "@/components/modals/AddNewWorkspace"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const workspaces = [
    {
      id: 1,
      name: "Workspace A",
      projects: ["Website Redesign", "Mobile App"],
    },
    {
      id: 2,
      name: "Workspace B",
      projects: ["Marketing Dashboard", "Research Data"],
    },
  ]

  const [expandedWorkspace, setExpandedWorkspace] = useState<number | null>(1)

  const breadcrumbItems = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((part, index, arr) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      href: "/" + arr.slice(0, index + 1).join("/"),
    }))

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50
        w-64 h-screen bg-gray-900 text-white 
        flex flex-col p-4
        overflow-y-auto
        scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="flex items-center justify-between mb-6 md:hidden">
        <h2 className="text-xl font-bold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="hidden md:flex text-2xl font-bold mb-6 items-center gap-2">
        <div className="w-8 h-8 bg-white rounded"></div>
        Logo
      </div>

      <nav className="space-y-2">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 hover:text-blue-500 ${pathname.includes("/dashboard") && "bg-gray-800"
            }`}
          onClick={() => router.push("/admin/dashboard")}
        >
          <Home className="h-4 w-4" /> Dashboard
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 hover:text-blue-500 ${pathname.includes("/projects") && "bg-gray-800"
            }`}
          onClick={() => router.push("/admin/projects")}
        >
          <List className="h-4 w-4" /> Projects
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 hover:text-blue-500 ${pathname.includes("/team") && "bg-gray-800"
            }`}
          onClick={() => router.push("/admin/team")}
        >
          <Users className="h-4 w-4" /> Team
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 hover:text-blue-500 ${pathname.includes("/files") && "bg-gray-800"
            }`}
          onClick={() => router.push("/admin/files")}
        >
          <Folder className="h-4 w-4" /> Files
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 hover:text-blue-500 ${pathname.includes("/settings") && "bg-gray-800"
            }`}
          onClick={() => router.push("/admin/settings")}
        >
          <Settings className="h-4 w-4" /> Settings
        </Button>

        <Button variant="ghost"
          className={`w-full justify-start gap-2 text-red-400 hover:text-gray-500 ${pathname.includes("/settings") && "bg-gray-800"
            }`}
          onClick={() => router.push("/auth/login")}
        >
          <LogOut className="h-4 w-4" /> Log Out
        </Button>
      </nav>

      <div className="mt-8 border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm uppercase tracking-wide text-gray-400">Workspace</h2>
          <AddNewWorkspace />
        </div>

        <div className="space-y-2">
          {workspaces.map((ws) => (
            <div key={ws.id}>
              <button
                className="flex items-center justify-between w-full text-left hover:text-blue-400"
                onClick={() =>
                  setExpandedWorkspace(
                    expandedWorkspace === ws.id ? null : ws.id
                  )
                }
              >
                <span className="font-medium">{ws.name}</span>
                {expandedWorkspace === ws.id ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedWorkspace === ws.id && (
                <ul className="mt-1 ml-4 space-y-1 text-gray-400">
                  {ws.projects.map((proj) => {
                    const projectSlug = proj.toLowerCase().replace(/\s+/g, "-")

                    return (
                      <li
                        key={proj}
                        onClick={() => router.push(`/admin/projects/${projectSlug}`)}
                        className={`
            flex items-center gap-2 hover:text-blue-400 cursor-pointer text-sm 
            px-2 py-1 rounded transition
            ${pathname.includes(`/projects/${projectSlug}`)
                            ? "bg-gray-800 text-blue-400"
                            : ""
                          }`}
                      >
                        <FolderKanban className="w-3 h-3" />
                        {proj}
                      </li>
                    )
                  })}
                </ul>
              )}

            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-3 text-xs text-gray-400">
        {breadcrumbItems.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-gray-500">You are here:</span>
            {breadcrumbItems.map((item, i) => (
              <div key={item.href} className="flex items-center gap-1">
                <Link
                  href={item.href}
                  className="hover:text-blue-400 transition"
                >
                  {item.label}
                </Link>
                {i < breadcrumbItems.length - 1 && <span>/</span>}
              </div>
            ))}
          </div>
        ) : (
          <p>Dashboard</p>
        )}
      </div>
    </aside>
  )
}
