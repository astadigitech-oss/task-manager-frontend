import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface CustomToastProps {
    title: string;
    description?: string;
    type: "success" | "error" | "warning" | "info";
}

export function CustomToast({ title, description, type }: CustomToastProps) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
    };

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
    };

    const handleToastClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    return (
        <div
            onClick={handleToastClick}
            onMouseDown={handleToastClick}
            onPointerDown={handleToastClick}
            className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
                "min-w-75 max-w-105",
                "cursor-default select-none",
                styles[type]
            )}
            style={{ zIndex: 9999 }}
            role="alert"
            aria-live="assertive"
        >
            <div className="shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1 space-y-1">
                <p className="font-semibold text-sm">{title}</p>
                {description && (
                    <p className="text-sm opacity-90">{description}</p>
                )}
            </div>
        </div>
    );
}

interface ConfirmToastProps {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function ConfirmToast({
    title,
    description,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
}: ConfirmToastProps) {
    const handleToastClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const handleConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onConfirm();
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onCancel();
    };

    return (
        <div
            onClick={handleToastClick}
            onMouseDown={handleToastClick}
            onPointerDown={handleToastClick}
            className={cn(
                "pointer-events-auto flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-lg backdrop-blur-sm",
                "min-w-[320px] max-w-105",
                "cursor-default select-none"
            )}
            style={{ zIndex: 9999 }}
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
        >
            <div className="space-y-1">
                <p id="confirm-title" className="font-semibold text-sm text-foreground">
                    {title}
                </p>
                <p id="confirm-description" className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={handleCancel}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={cn(
                        "px-3 py-1.5 text-sm rounded-md border border-border",
                        "hover:bg-muted transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    )}
                    type="button"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={handleConfirm}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={cn(
                        "px-3 py-1.5 text-sm rounded-md",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    )}
                    type="button"
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    );
}