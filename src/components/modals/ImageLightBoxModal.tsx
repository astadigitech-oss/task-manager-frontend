"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Trash2, 
  Maximize2,
  Minimize    
} from "lucide-react"

import { useState, useEffect } from "react"

interface ImageLightboxModalProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (index: number) => void;
  canDelete?: boolean;
  allowDownload?: boolean;          // NEW
}

export function ImageLightboxModal({ 
  images, 
  initialIndex = 0, 
  open, 
  onOpenChange,
  onDelete,
  canDelete = false,
  allowDownload = true              // NEW
}: ImageLightboxModalProps) {

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);  // NEW

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, open]);

  // Fullscreen Tracking
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-" || e.key === "_") handleZoomOut();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, zoom]);


  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    if (!allowDownload) return;
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `attachment-${currentIndex + 1}.png`;
    link.click();
  };

  const handleDelete = () => {
    if (onDelete && canDelete) {
      onDelete(currentIndex);
      if (currentIndex >= images.length - 1) {
        setCurrentIndex(Math.max(0, images.length - 2));
      }
      if (images.length <= 1) {
        onOpenChange(false);
      }
    }
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !w-screen !h-screen p-0 bg-black/50 border-none !m-0 !rounded-none">

        <DialogTitle className="sr-only">
          Image Preview - {currentIndex + 1} of {images.length}
        </DialogTitle>

        {/* HEADER */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">

          <p className="text-white text-base font-medium">
            {currentIndex + 1} / {images.length}
          </p>

          <div className="flex items-center gap-3">

            {/* Zoom Out */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 h-9 w-9"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-white text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            {/* Zoom In */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 h-9 w-9"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>


            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-9 w-9"
              onClick={toggleFullscreen}
            >
              {isFullscreen 
                ? <Minimize className="h-4 w-4" /> 
                : <Maximize2 className="h-4 w-4" />}
            </Button>


            {/* Download */}
            <Button
              variant="ghost"
              size="icon"
              disabled={!allowDownload}
              className={`h-9 w-9 ${
                allowDownload
                  ? "text-white hover:bg-white/20"
                  : "text-gray-500 cursor-not-allowed opacity-50"
              }`}
              onClick={allowDownload ? handleDownload : undefined}
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Delete */}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-red-500/20 h-9 w-9"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-9 w-9"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>


        {/* IMAGE WRAPPER */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">

          {/* Prev */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-40 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-40 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* IMAGE */}
          <div className="relative w-full h-full flex items-center justify-center p-20 pb-32">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out cursor-zoom-in"
              style={{
                transform: `scale(${zoom})`,
                imageRendering: zoom > 1 ? "crisp-edges" : "auto",
              }}
              onClick={() => setZoom(prev => prev === 1 ? 2 : 1)}
            />
          </div>
        </div>


        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-3 justify-center items-center overflow-x-auto scrollbar-thin scrollbar-thumb-white/30 pb-2 px-4">

              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? "border-white scale-110 shadow-lg shadow-white/30"
                      : "border-white/30 hover:border-white/60 opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoom(1);
                  }}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}

            </div>
          </div>
        )}


      </DialogContent>
    </Dialog>
  );
}
