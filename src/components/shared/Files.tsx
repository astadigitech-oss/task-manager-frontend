"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components//ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FolderPlus,
  Folder,
  ArrowUpDown,
  FileText,
  Image as ImageIcon,
  File,
  ChevronLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkspace } from "@/context/WorkspaceContext";

interface FolderItem {
  id: string;
  name: string;
  filesCount: number;
  icon: any;
}

interface FileItem {
  id: string;
  name: string;
  size: string;
  lastModified: string;
  members: string[];
  type: "document" | "image" | "pdf" | "other";
}

const folders: FolderItem[] = [
  { id: "1", name: "Documents", filesCount: 235, icon: Folder },
  { id: "2", name: "Music", filesCount: 89, icon: Folder },
  { id: "3", name: "Work projects", filesCount: 124, icon: Folder },
  { id: "4", name: "Personal Media", filesCount: 456, icon: Folder },
  { id: "5", name: "Backup data", filesCount: 67, icon: Folder },
  { id: "6", name: "Root", filesCount: 12, icon: Folder },
];

const recentFiles: FileItem[] = [
  {
    id: "1",
    name: "Proposal.docx",
    size: "2.5 MB",
    lastModified: "Feb/21/2023",
    members: ["1", "2", "3"],
    type: "document",
  },
  {
    id: "2",
    name: "Background.jpg",
    size: "10 MB",
    lastModified: "Mar/21/2022",
    members: ["1", "2", "3"],
    type: "image",
  },
  {
    id: "3",
    name: "Documents.docx",
    size: "14.5 KB",
    lastModified: "Mar/18/2023",
    members: ["1", "2", "3"],
    type: "document",
  },
  {
    id: "4",
    name: "Omlegas.pdf",
    size: "5 MB",
    lastModified: "Jun/17/2021",
    members: ["1"],
    type: "pdf",
  },
];

const storageData = [
  { label: "Documents", used: 80, total: 100, color: "bg-blue-500" },
  { label: "Images", used: 40, total: 100, color: "bg-emerald-500" },
  { label: "Videos", used: 60, total: 100, color: "bg-purple-500" },
  { label: "Others", used: 20, total: 100, color: "bg-amber-500" },
];

export function FilesPage() {
  const { members } = useWorkspace();
  const [sortBy, setSortBy] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "pdf":
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-slate-900">File Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create New Folder
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Folders & Recent Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Folders Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-slate-700" />
                  <h2 className="text-slate-900">All Files</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                  Show All
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    className="bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg p-4 text-left group"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Folder className="h-5 w-5 text-slate-700" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-slate-900 mb-1">{folder.name}</h3>
                      <p className="text-xs text-slate-500">
                        {folder.filesCount} files
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Files Table */}
            <Card className="p-6">
              <h2 className="text-slate-900 mb-4">Recent File</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-900">
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-900">
                          Size
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-900">
                          Last Modified
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-900">
                          Member
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFiles.map((file) => {
                      const fileMembers = members.filter((m) =>
                        file.members.includes(m.id)
                      );

                      return (
                        <TableRow key={file.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-900 rounded-lg text-white">
                                {getFileIcon(file.type)}
                              </div>
                              <span className="text-slate-900">{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {file.size}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {file.lastModified}
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {fileMembers.map((member) => (
                                <Avatar
                                  key={member.id}
                                  className="h-8 w-8 border-2 border-white"
                                >
                                  <AvatarImage
                                    src={member.avatar}
                                    alt={member.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Right Column - Storage & Activity */}
          <div className="space-y-6">
            {/* Storage Graph */}
            <Card className="p-6">
              <h3 className="text-slate-900 mb-6">Storage Graph</h3>
              <div className="space-y-4">
                {storageData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-white`}>
                          {getFileIcon(item.label.toLowerCase())}
                        </div>
                        <span className="text-sm text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-sm text-slate-900">{item.used} GB</span>
                    </div>
                    <Progress 
                      value={item.used} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity Chart Placeholder */}
            <Card className="p-6">
              <h3 className="text-slate-900 mb-4">Activity Chart</h3>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-sm">Chart will be displayed here</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
