"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface ImageGallerySectionProps {
    imageUrls: string[];
    currentIndex: number;
    mode?: "admin" | "member";
    onPrevious: () => void;
    onNext: () => void;
    onOpenLightbox: (index: number) => void;
}

export function ImageGallerySection({
    imageUrls,
    currentIndex,
    onPrevious,
    onNext,
    onOpenLightbox,
}: ImageGallerySectionProps) {
    if (!imageUrls.length) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
                Tidak ada gambar
            </div>
        );
    }

    return (
        <div className="shrink-0 border-t border-border p-4 bg-surface">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-foreground">Project Images</h3>
                {imageUrls.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {currentIndex + 1} / {imageUrls.length}
                    </span>
                )}
            </div>
            <div className="relative">
                    <>
                        <div
                            className="w-full h-36 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-border"
                            onClick={() => onOpenLightbox(currentIndex)}
                        >
                            <img
                                src={imageUrls[currentIndex]}
                                loading="lazy"
                                alt={`Project image ${currentIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs px-2 hover:surface-hover"
                                onClick={onPrevious}
                                disabled={currentIndex === 0}
                            >
                                ← Prev
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs px-2 hover:surface-hover"
                                onClick={onNext}
                                disabled={currentIndex >= imageUrls.length - 1}
                            >
                                Next →
                            </Button>
                        </div>
                    </>
            </div>
        </div>
    );
}
