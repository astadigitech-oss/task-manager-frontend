"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react"
import { ImageLightBoxModal } from "@/components/modals/ImageLightBoxModal"
import { toast } from "sonner"

interface UploadImageDialogProps {
  projectId: string;
  onUpload?: (images: string[]) => void; // Return image URLs/base64
  existingImages?: string[]; // Untuk preview gambar yang sudah ada
}

export function UploadImageDialog({ projectId, onUpload, existingImages = [] }: UploadImageDialogProps) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)

      // Validasi: hanya image files
      const nonImageFiles = newFiles.filter(file => !file.type.startsWith('image/'))
      if (nonImageFiles.length > 0) {
        toast.error("File tidak valid!", {
          description: "Hanya file gambar yang diperbolehkan.",
        })
        return
      }

      // Validasi: max 10MB per file
      const maxSize = 10 * 1024 * 1024 // 10MB
      const oversizedFiles = newFiles.filter(file => file.size > maxSize)
      if (oversizedFiles.length > 0) {
        toast.error("File terlalu besar!", {
          description: `${oversizedFiles.length} file melebihi batas 10MB.`,
        })
        return
      }

      setSelectedFiles(prev => [...prev, ...newFiles])

      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })

      toast.success("Gambar dipilih!", {
        description: `${newFiles.length} gambar siap diupload.`,
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    const fileName = selectedFiles[index]?.name
    setImages(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    if (currentIndex >= images.length - 1) {
      setCurrentIndex(Math.max(0, images.length - 2))
    }

    toast.success("Gambar dihapus!", {
      description: `${fileName || 'Gambar'} telah dihapus dari daftar.`,
    })
  }

  const handleUpload = () => {
    if (!images.length) {
      toast.error("Tidak ada gambar!", {
        description: "Silakan pilih gambar terlebih dahulu.",
      })
      return
    }

    try {
      if (onUpload && images.length > 0) {
        onUpload(images) // Send base64 images
      }

      toast.success("Upload berhasil!", {
        description: `${images.length} gambar telah diupload.`,
      })

      // Reset
      setImages([])
      setSelectedFiles([])
      setCurrentIndex(0)
      setSearchQuery("")
      setOpen(false)
    } catch (error) {
      toast.error("Upload gagal!", {
        description: "Terjadi kesalahan saat mengupload gambar.",
      })
    }
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 4))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(images.length - 1, prev + 4))
  }

  const visibleImages = images.slice(currentIndex, currentIndex + 4)

  // Combine existing + new images untuk preview di lightbox
  const allImages = [...existingImages, ...images]

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(currentIndex + index)
    setLightboxOpen(true)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Image
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[1200px] h-[720px] p-2 gap-0 flex flex-col dialog">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">Upload Project Images</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="px-6 py-4">
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Image Gallery Preview */}
            <div className="px-6 pb-4">
              <div className="relative flex items-center gap-4">
                
                {/* Previous Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-4 z-10 h-12 w-12 rounded-full surface-elevated shadow-md hover:surface-hover"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Images Grid */}
                <div className="flex-1 grid grid-cols-4 gap-4 min-h-[160px]">
                  {visibleImages.map((img, idx) => (
                    <div
                      key={currentIndex + idx}
                      className="relative aspect-video surface rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => handleOpenLightbox(idx)}
                    >
                      <img
                        src={img}
                        alt={`Preview ${currentIndex + idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage(currentIndex + idx)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 4 - visibleImages.length) }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-video surface rounded-lg"
                    />
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-4 z-10 h-12 w-12 rounded-full surface-elevated shadow-md hover:surface-hover"
                  onClick={handleNext}
                  disabled={currentIndex + 4 >= images.length}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="flex-1 px-6 pb-6">
              <h3 className="text-lg font-semibold mb-4">Attachments</h3>
              
              <div
                className="w-full h-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 surface hover:surface-hover transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted" />
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground underline">Upload</p>
                  <p className="text-sm text-muted mt-1">
                    Click to browse or drag and drop your images
                  </p>
                </div>
                {images.length > 0 && (
                  <p className="text-sm text-muted">
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t px-6 py-4 flex justify-end gap-3 divider">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={images.length === 0}
                className="button-primary"
              >
                Upload {images.length > 0 && `(${images.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox for Preview */}
      <ImageLightBoxModal
        images={allImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        canDelete={false}
      />
    </>
  )
}