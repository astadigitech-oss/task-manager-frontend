"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export default function Header() {
    return (
        <footer className="bg-white text-center py-3 border-t text-sm text-gray-500">
            © {new Date().getFullYear()} Task Manager. All rights reserved.
        </footer>
    )
}
