"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Loader2 } from "lucide-react";

import { WorkspaceApi, WorkspaceRequest, WorkspaceMemberApi } from "@/types/api/workspace.api";
import { UserApi } from "@/types/api/user.api";
import { useWorkspace } from "@/context/WorkspaceContext";
import { workspaceMembersService } from "@/services/workspaces/workspaceMember.service";
import { usersService } from "@/services/user.service";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast-helpers";
import { UserAvatar } from "../shared/UserAvatar";

interface EditWorkspaceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    workspace: WorkspaceApi;
    onUpdate: (id: number, data: Partial<WorkspaceRequest>) => Promise<void>;
}

export function EditWorkspaceDialog({
    isOpen,
    onClose,
    workspace,
    onUpdate,
}: EditWorkspaceDialogProps) {
    const { addBulkMembersToWorkspace } = useWorkspace();

    const [name, setName] = useState("");
    const [color, setColor] = useState("#4f46e5");
    const [isUpdating, setIsUpdating] = useState(false);

    const [currentMembers, setCurrentMembers] = useState<WorkspaceMemberApi[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserApi[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Initialize form data when dialog opens
    useEffect(() => {
        if (isOpen && workspace) {
            setName(workspace.name);
            setColor(
                typeof workspace.color === "string" && workspace.color.trim() !== ""
                    ? workspace.color
                    : "#4f46e5"
            );
        }
    }, [isOpen, workspace]);

    // ✅ Single unified effect — removed the duplicate members-only fetch
    useEffect(() => {
        if (!isOpen || !workspace?.id) return;

        const fetchMembersAndUsers = async () => {
            setIsLoadingMembers(true);
            setIsLoadingUsers(true);

            try {
                const [membersResponse, usersResponse] = await Promise.all([
                    workspaceMembersService.getAll(workspace.id),
                    usersService.getAllUsers({ limit: 1000 }),
                ]);

                const members =
                    membersResponse.success && membersResponse.data
                        ? membersResponse.data
                        : [];
                setCurrentMembers(members);
                setIsLoadingMembers(false);

                if (usersResponse.success && usersResponse.data) {
                    const memberUserIds = new Set(
                        members.map((m) => {
                            const userId = m.user_id || (m as any).user?.id || m.id;
                            return Number(userId);
                        })
                    );

                    const filtered = usersResponse.data.users.filter(
                        (user) => !memberUserIds.has(Number(user.id))
                    );

                    setAvailableUsers(filtered);
                } else {
                    setAvailableUsers([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setCurrentMembers([]);
                setAvailableUsers([]);
            } finally {
                setIsLoadingMembers(false);
                setIsLoadingUsers(false);
            }
        };

        fetchMembersAndUsers();
    }, [isOpen, workspace?.id]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedUsers([]);
        }
    }, [isOpen]);

    if (!workspace) return null;

    const toggleUser = (userId: number) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === availableUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(availableUsers.map((u) => u.id));
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        try {
            await workspaceMembersService.remove(workspace.id, memberId);
            setCurrentMembers((prev) => prev.filter((m) => m.id !== memberId));
            showSuccessToast("Member berhasil dihapus");
        } catch (err) {
            showErrorToast("Gagal menghapus member");
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            showErrorToast("Nama workspace wajib diisi");
            return;
        }

        setIsUpdating(true);

        try {
            const payload: Partial<WorkspaceRequest> = {
                name: name.trim(),
                color,
            };

            await onUpdate(workspace.id, payload);

            if (selectedUsers.length > 0) {
                await addBulkMembersToWorkspace(workspace.id, selectedUsers);
            }

            onClose();
        } catch (err) {
            console.error("Failed to update workspace:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-2xl p-0 gap-0 flex flex-col"
                style={{ maxHeight: "90vh", height: "90vh" }}
                aria-describedby={undefined}
            >
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle>Edit Workspace</DialogTitle>
                    <DialogDescription>
                        Perbarui detail workspace dan kelola anggota tim.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ScrollArea className="h-full max-h-[calc(90vh-140px)]">
                        <div className="space-y-6 px-6 py-4">
                            {/* Workspace Name */}
                            <div className="space-y-2">
                                <Label>Nama Workspace</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Marketing, Development..."
                                    className="text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800"
                                />
                            </div>

                            {/* Color */}
                            <div className="space-y-2">
                                <Label>Warna</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-20 h-10"
                                    />
                                    <Input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="#4f46e5"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* Current Members */}
                            <div className="space-y-2">
                                <Label>Anggota Saat Ini ({currentMembers.length})</Label>
                                {isLoadingMembers ? (
                                    <div className="border rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground text-center">
                                            Memuat anggota...
                                        </p>
                                    </div>
                                ) : currentMembers.length > 0 ? (
                                    <ScrollArea className="h-48 border rounded-md p-2">
                                        <div className="p-2">
                                            {currentMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <UserAvatar
                                                            name={member.name}
                                                            avatar={member.profile_img}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {member.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {member.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                                        Belum ada anggota
                                    </p>
                                )}
                            </div>

                            {/* Add New Members */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <Label>Tambah Anggota Baru</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Pilih Semua</span>
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedUsers.length === availableUsers.length &&
                                                availableUsers.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            disabled={availableUsers.length === 0}
                                            className="cursor-pointer w-4 h-4"
                                        />
                                    </div>
                                </div>

                                {isLoadingUsers ? (
                                    <div className="border rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground text-center">
                                            Memuat users...
                                        </p>
                                    </div>
                                ) : availableUsers.length === 0 ? (
                                    <div className="border rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground text-center">
                                            Tidak ada user baru yang tersedia
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <ScrollArea className="h-48 border rounded-md p-2">
                                            {availableUsers.map((user) => {
                                                const userAvatar =
                                                    (user as any).profile_image || user.avatar || "";
                                                return (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <UserAvatar
                                                                name={user.name}
                                                                avatar={user.avatar || userAvatar}
                                                                size="md"
                                                                bustCache
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {user.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {user.role}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => toggleUser(user.id)}
                                                            className="cursor-pointer shrink-0"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </ScrollArea>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedUsers.length} user dipilih untuk ditambahkan
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="px-6 py-4 border-t shrink-0">
                    <DialogClose asChild>
                        <Button className="bg-gray-500 hover:bg-gray-600 text-white" disabled={isUpdating}>
                            Batal
                        </Button>
                    </DialogClose>
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={handleSubmit} disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}