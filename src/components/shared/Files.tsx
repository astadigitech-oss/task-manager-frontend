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
  Home,
  Settings as SettingsIcon,
  FolderArchive,
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";

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
  const { user } = useAuthStore();
  const router = useRouter();

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return { icon: <FileText className="h-4 w-4" />, bgColor: "bg-blue-500", textColor: "text-blue-500" };
      case "image":
        return { icon: <ImageIcon className="h-4 w-4" />, bgColor: "bg-emerald-500", textColor: "text-emerald-500" };
      case "pdf":
        return { icon: <File className="h-4 w-4" />, bgColor: "bg-red-500", textColor: "text-red-500" };
      default:
        return { icon: <File className="h-4 w-4" />, bgColor: "bg-slate-500", textColor: "text-slate-500" };
    }
  };

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/member/dashboard";

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Breadcrumb className="mb-0">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push(dashboardPath)}
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    <FolderArchive className="w-4 h-4" />
                    Files
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {user?.role === "admin" && (
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
          )}
        </div>
      </div>
      
      <Separator />

      {/* Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Folders & Recent Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Folders Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-foreground">All Files</h2>
                </div>
                {/* <Badge variant="outline" className="text-xs">
                  Show All
                </Badge> */}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    className="surface rounded-lg p-4 text-left group hover:surface-hover transition-all shadow-sm hover:shadow-md border border-border"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="p-2 bg-card rounded-lg shadow-sm">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-foreground mb-1">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {folder.filesCount} files
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Files Table */}
            <Card className="p-6">
              <h2 className="text-foreground mb-4">Recent File</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-elevated">
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-foreground">
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-foreground">
                          Size
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-foreground">
                          Last Modified
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-foreground">
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
                      const fileIconData = getFileIcon(file.type);

                      return (
                        <TableRow key={file.id} className="hover:surface-hover">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 ${fileIconData.bgColor} rounded-lg text-white`}>
                                {fileIconData.icon}
                              </div>
                              <span className="text-foreground">{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.size}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.lastModified}
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {fileMembers.map((member) => (
                                <Avatar
                                  key={member.id}
                                  className="h-8 w-8 border-2 border-card"
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
              <h3 className="text-foreground mb-6">Storage Graph</h3>
              <div className="space-y-4">
                {storageData.map((item, index) => {
                  const fileIconData = getFileIcon(item.label.toLowerCase());

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${item.color}`}>
                            {fileIconData.icon}
                          </div>
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm text-foreground">{item.used} GB</span>
                      </div>
                      <Progress
                        value={item.used}
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Activity Chart Placeholder */}
            <Card className="p-6">
              <h3 className="text-foreground mb-4">Activity Chart</h3>
              <div className="h-64 flex items-center justify-center bg-surface-elevated rounded-lg">
                <p className="text-muted-foreground text-sm">Chart will be displayed here</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
