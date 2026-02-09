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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

    // Members state
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

    // Fetch current workspace members
    useEffect(() => {
        if (!isOpen || !workspace?.id) return;

        const fetchMembers = async () => {
            setIsLoadingMembers(true);
            try {
                const response = await workspaceMembersService.getAll(workspace.id);

                if (response.success && response.data) {
                    setCurrentMembers(response.data);
                } else {
                    setCurrentMembers([]);
                }
            } catch (err) {
                setCurrentMembers([]);
            } finally {
                setIsLoadingMembers(false);
            }
        };

        fetchMembers();
    }, [isOpen, workspace?.id]);

    useEffect(() => {
        if (!isOpen || !workspace?.id) return;

        const fetchMembersAndUsers = async () => {
            setIsLoadingMembers(true);
            setIsLoadingUsers(true);

            try {
                // Fetch members dan users secara paralel
                const [membersResponse, usersResponse] = await Promise.all([
                    workspaceMembersService.getAll(workspace.id),
                    usersService.getAllUsers({ limit: 1000 })
                ]);

                // Set current members
                const members = membersResponse.success && membersResponse.data
                    ? membersResponse.data
                    : [];
                setCurrentMembers(members);
                setIsLoadingMembers(false);

                // Filter available users berdasarkan members
                if (usersResponse.success && usersResponse.data) {
                    if (members.length > 0) {
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
                        setAvailableUsers(usersResponse.data.users);
                    }
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
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-screen flex flex-col"
            aria-describedby={undefined}>
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>Edit Workspace</DialogTitle>
                    <DialogDescription>
                        Perbarui detail workspace dan kelola anggota tim.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="space-y-6 py-4 px-6 overflow-y-auto flex-1">
                        {/* Workspace Name Section */}
                        <div className="space-y-2">
                            <Label>Nama Workspace</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Marketing, Development..."
                                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800"
                            />
                        </div>

                        {/* Color Field Section */}
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

                        {/* Current Members Section */}
                        <div className="mt-4">
                            <Label>Anggota Saat Ini ({currentMembers.length})</Label>
                            {isLoadingMembers ? (
                                <div className="border rounded-lg p-4 mt-2">
                                    <p className="text-sm text-muted-foreground text-center">
                                        Memuat anggota...
                                    </p>
                                </div>
                            ) : currentMembers.length > 0 ? (
                                <ScrollArea className="h-48 border rounded-md mt-2 p-2">
                                    <div className="p-2">
                                        {currentMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <UserAvatar
                                                        name={member.name}
                                                        avatar={member.profile_img}>
                                                    </UserAvatar>
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
                                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg mt-2">
                                    Belum ada anggota
                                </p>
                            )}
                        </div>

                        {/* Add New Members */}
                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                            <Label>Tambah Anggota Baru</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Pilih Semua</span>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === availableUsers.length && availableUsers.length > 0}
                                    onChange={toggleSelectAll}
                                    disabled={availableUsers.length === 0}
                                    className="cursor-pointer w-4 h-4"
                                />
                            </div>
                        </div>

                        {isLoadingUsers ? (
                            <div className="border rounded-lg p-4 mt-2">
                                <p className="text-sm text-muted-foreground text-center">
                                    Memuat users...
                                </p>
                            </div>
                        ) : availableUsers.length === 0 ? (
                            <div className="border rounded-lg p-4 mt-2">
                                <p className="text-sm text-muted-foreground text-center">
                                    Tidak ada user baru yang tersedia
                                </p>
                            </div>
                        ) : (
                            <>
                                <ScrollArea className="h-48 border rounded-md mt-2 p-2">
                                    {availableUsers.map((user) => {
                                        const userAvatar = (user as any).profile_image || user.avatar || "";
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
                                                        <p className="text-sm font-medium truncate">{user.name}</p>
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

                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedUsers.length} user dipilih untuk ditambahkan
                                </p>
                            </>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-4 border-t">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isUpdating}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button onClick={handleSubmit} disabled={isUpdating}>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}