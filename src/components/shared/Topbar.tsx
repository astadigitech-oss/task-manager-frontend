"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AddProjectModal from "../modals/AddProjectModal"

export default function Topbar() {
    return (
        <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm rounded-xl mb-6">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                    <AddProjectModal />
                    {/* <div className="w-8 h-8 rounded-full bg-gray-300" /> */}
                </div>
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold">Jhon Dewe</p>
                        <p className="text-xs text-gray-500">admin</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
