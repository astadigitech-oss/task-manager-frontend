"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (workspace: { name: string; color: string; projectIds: string[] }) => void;
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Indigo", value: "#6366f1" },
];

export function CreateWorkspaceDialog({
  isOpen,
  onClose,
  onCreate,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!name.trim()) {
      toast.error("Nama workspace wajib diisi!", {
        description: "Silakan masukkan nama workspace.",
      });
      return;
    }

    if (name.trim().length < 3) {
      toast.error("Nama workspace terlalu pendek!", {
        description: "Nama workspace minimal 3 karakter.",
      });
      return;
    }

    onCreate({
      name: name.trim(),
      color: selectedColor,
      projectIds: [],
    });

    // Reset form
    setName("");
    setSelectedColor(colorOptions[0].value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Buat Workspace Baru</DialogTitle>
          <DialogDescription>
            Buat workspace untuk mengelompokkan project Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4 px-6">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Workspace</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama workspace"
                required
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <Label>Pilih Warna</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.value
                        ? "border-slate-900 scale-110"
                        : "border-slate-200 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Buat Workspace</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
