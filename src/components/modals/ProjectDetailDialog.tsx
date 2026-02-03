"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { projectMembersService } from "@/services/projects/projectMember.service";
import { ProjectApi, ProjectMemberApi } from "@/types/api/project.api";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderSearch, X } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { projectsService } from "@/services/projects/project.service";
import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "@/context/ProjectContext";

type ProjectDetailDialogProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    project: ProjectApi;
};

export function ProjectDetailDialog({
    open,
    onOpenChange,
    project,
}: ProjectDetailDialogProps) {
    const { data, isLoading } = useQuery({
        queryKey: projectKeys.detail(project.id),
        queryFn: () => projectsService.detail(project.id),
        enabled: !!project,
    });
    const { workspaces } = useWorkspace();

    const [members, setMembers] = useState<ProjectMemberApi[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchMembers = async () => {
            try {
                setLoading(true);
                const res = await projectMembersService.getAll(project.id);
                if (res.success && Array.isArray(res.data)) {
                    setMembers(res.data);
                }
            } catch (e) {
                showErrorToast("Gagal memuat anggota project");
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [open, project.id]);

    const handleRemove = async (id: number) => {
        try {
            await projectMembersService.remove(project.id, id);
            setMembers((prev) => prev.filter((m) => m.id !== id));
            showSuccessToast("Member dihapus");
        } catch {
            showErrorToast("Gagal menghapus member");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-screen flex flex-col"
                aria-describedby={undefined}>
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Detail Project</DialogTitle>
                    <DialogDescription>
                        Informasi project dan anggota tim
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-6 py-4 px-6 overflow-y-auto flex-1 gap-4">
                    {/* Project Name Section */}
                    <div>
                        <Label className="space-y-2">Nama Project</Label>
                        <Input value={project.name} disabled />
                    </div>
                    {/* Project Description Section */}
                    <div>
                        <Label className="space-y-2">Deskripsi</Label>
                        <Textarea value={project.description || ""} disabled />
                    </div>

                    {/* Workspace Section */}
                    <div>
                        <Label className="space-y-2">Workspace</Label>
                        <Select value={String(project.workspace_id)} disabled>
                            <SelectTrigger id="workspace" className="w-full border bg-white dark:bg-neutral-800">
                                <FolderSearch className="w-4 h-4 mr-2 text-gray-500" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {workspaces.map((ws) => (
                                    <SelectItem key={ws.id} value={String(ws.id)}>
                                        {ws.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Team Members Section */}
                    <div>
                        <Label>Anggota Tim</Label>
                        <ScrollArea className="h-48 border rounded-md mt-2">
                            {loading ? (
                                <p className="text-center py-4 text-sm text-muted-foreground">
                                    Memuat anggota...
                                </p>
                            ) : members.length === 0 ? (
                                <p className="text-center py-4 text-sm text-muted-foreground">
                                    Belum ada anggota
                                </p>
                            ) : (
                                members.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-2 hover:bg-muted group"
                                    >
                                        <div className="flex gap-3 items-center">
                                            <UserAvatar
                                                name={m.name}
                                                avatar={m.avatar || m.profile_img}
                                                size="sm"
                                                className="h-8 w-8"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{m.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {m.user_email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}