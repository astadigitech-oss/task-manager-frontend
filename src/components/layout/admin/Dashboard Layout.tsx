// "use client";

// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { 
//   LayoutDashboard, 
//   FolderKanban, 
//   Users, 
//   Settings,
//   Menu,
//   X,
//   LogOut,
//   ChevronDown,
//   ChevronRight,
//   Plus,
//   Folder,
//   FileText,
//   CheckSquare,
//   Briefcase,
// } from "lucide-react";
// import { useWorkspace } from "@/context/WorkspaceContext";
// import { CreateWorkspaceDialog } from "@/components/modals/CreateNewWorkspace";
// import { useModal } from "@/hooks/useModal";

// interface MenuItem {
//   id: string;
//   title: string;
//   icon: any;
// }

// const menuItems: MenuItem[] = [
//   {
//     id: "dashboard",
//     title: "Dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     id: "workspace",
//     title: "Workspaces",
//     icon: Briefcase,
//   },
//   {
//     id: "projects",
//     title: "Projects",
//     icon: FolderKanban,
//   },
//   {
//     id: "tasks",
//     title: "Tasks",
//     icon: CheckSquare,
//   },
//   {
//     id: "team",
//     title: "Team",
//     icon: Users,
//   },
//   {
//     id: "files",
//     title: "Files",
//     icon: FileText,
//   },
// ];

// interface DashboardLayoutProps {
//   children: React.ReactNode;
//   currentPage: string;
//   onNavigate: (page: string) => void;
// }

// export function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set(["1"]));
  
//   const { 
//     workspaces, 
//     getWorkspaceProjects, 
//     addWorkspace,
//     selectedWorkspaceId,
//     setSelectedWorkspaceId 
//   } = useWorkspace();

//   const { createWorkspace } = useModal();

//   const toggleWorkspace = (workspaceId: string) => {
//     const newExpanded = new Set(expandedWorkspaces);
//     if (newExpanded.has(workspaceId)) {
//       newExpanded.delete(workspaceId);
//     } else {
//       newExpanded.add(workspaceId);
//     }
//     setExpandedWorkspaces(newExpanded);
//   };

//   const handleWorkspaceClick = (workspaceId: string) => {
//     setSelectedWorkspaceId(workspaceId);
//     onNavigate("projects");
//   };

//   const handleCreateWorkspace = (workspace: { name: string; color: string; projectIds: string[] }) => {
//     addWorkspace(workspace);
//   };

//   const handleMenuClick = (page: string) => {
//     onNavigate(page);
//     setIsSidebarOpen(false);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Mobile Header */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         >
//           {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//         </Button>
//         <h1 className="ml-4 text-slate-900">Dashboard</h1>
//       </div>

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r transition-transform duration-200",
//           "lg:translate-x-0",
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         )}
//       >
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="h-16 flex items-center px-6 border-b">
//             <h2 className="text-slate-900">Team Manager</h2>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 overflow-y-auto p-4 space-y-1">
//             {menuItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleMenuClick(item.id)}
//                 className={cn(
//                   "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
//                   currentPage === item.id
//                     ? "bg-slate-900 text-white"
//                     : "text-slate-700 hover:bg-slate-100"
//                 )}
//               >
//                 <item.icon className="h-5 w-5" />
//                 <span>{item.title}</span>
//               </button>
//             ))}

//             {/* Workspaces Section */}
//             <div className="pt-4 mt-4 border-t">
//               <div className="flex items-center justify-between px-3 mb-2">
//                 <span className="text-xs text-slate-500 uppercase tracking-wider">
//                   Workspaces
//                 </span>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-6 w-6"
//                   onClick={createWorkspace.open}
//                 >
//                   <Plus className="h-3.5 w-3.5" />
//                 </Button>
//               </div>

//               <div className="space-y-1">
//                 {workspaces.map((workspace) => {
//                   const projects = getWorkspaceProjects(workspace.id);
//                   const isExpanded = expandedWorkspaces.has(workspace.id);

//                   return (
//                     <div key={workspace.id}>
//                       <div className="flex items-center gap-1">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-7 w-7 flex-shrink-0"
//                           onClick={() => toggleWorkspace(workspace.id)}
//                         >
//                           {isExpanded ? (
//                             <ChevronDown className="h-3.5 w-3.5" />
//                           ) : (
//                             <ChevronRight className="h-3.5 w-3.5" />
//                           )}
//                         </Button>
//                         <button
//                           onClick={() => handleWorkspaceClick(workspace.id)}
//                           className={cn(
//                             "flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left",
//                             selectedWorkspaceId === workspace.id
//                               ? "bg-slate-100 text-slate-900"
//                               : "text-slate-700 hover:bg-slate-50"
//                           )}
//                         >
//                           <Folder className="h-4 w-4" />
//                           <span className="truncate">{workspace.name}</span>
//                           <span className="text-xs text-slate-500">
//                             {projects.length}
//                           </span>
//                         </button>
//                       </div>

//                       {/* Workspace Projects */}
//                       {isExpanded && (
//                         <div className="ml-8 mt-1 space-y-1">
//                           {projects.map((project) => (
//                             <button
//                               key={project.id}
//                               onClick={() => handleMenuClick("projects")}
//                               className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
//                             >
//                               <FolderKanban className="h-3.5 w-3.5" />
//                               <span className="truncate">{project.name}</span>
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </nav>

//           {/* User Profile / Settings */}
//           <div className="p-4 border-t space-y-1">
//             <button
//               onClick={() => handleMenuClick("settings")}
//               className={cn(
//                 "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
//                 currentPage === "settings"
//                   ? "bg-slate-900 text-white"
//                   : "text-slate-700 hover:bg-slate-100"
//               )}
//             >
//               <Settings className="h-5 w-5" />
//               <span>Settings</span>
//             </button>
//             <Button
//               variant="ghost"
//               className="w-full justify-start gap-3"
//               onClick={() => onNavigate("login")}
//             >
//               <LogOut className="h-5 w-5" />
//               <span>Logout</span>
//             </Button>
//           </div>
//         </div>
//       </aside>

//       {/* Overlay for mobile */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Main Content */}
//       <main className="lg:ml-64 min-h-screen pt-0 lg:pt-0">
//         {children}
//       </main>

//       <CreateWorkspaceDialog
//         isOpen={createWorkspace.isOpen}
//         onClose={createWorkspace.close}
//         onCreate={handleCreateWorkspace}
//       />
//     </div>
//   );
// }
