"use client";

import { Plus, List, Image as ImgIcon } from "lucide-react";

export default function HeaderArea({ progress }: { progress: number }) {
  return (
    <div className="bg-white border-b p-6">
      <div className="max-w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-900">{"<"}</button>
            <div>
              <h1 className="text-2xl font-semibold">Website Redesign</h1>
              <p className="text-sm text-gray-500">Redesign Company Website with new Branding</p>
            </div>
          </div>

          <div className="mt-4 max-w-[760px]">
            <div className="text-xs text-gray-500 mb-1">Progress</div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <div className="text-xs text-right text-gray-500 mt-1">{progress}% Complete</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50">
            <ImgIcon className="w-4 h-4" /> Image
          </button>
          <button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 bg-gray-100">
            <List className="w-4 h-4" /> List
          </button>
          <button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 bg-white hover:bg-gray-50">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>
    </div>
  );
}