"use client"

import * as React from "react"
import { Upload, X, Loader2, ImageIcon, ZoomIn, ChevronLeft, ChevronRight, Trash } from "lucide-react"
import { ApiService, SamplePhoto } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PhotoUploadProps {
    sampleId: number
    existingPhotos?: SamplePhoto[]
    onPhotosChange?: () => void
}

export function PhotoUpload({ sampleId, existingPhotos = [], onPhotosChange }: PhotoUploadProps) {
    const [photos, setPhotos] = React.useState<SamplePhoto[]>(existingPhotos)
    const [uploading, setUploading] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const [dragActive, setDragActive] = React.useState(false)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | null>(null)
    const [photoToDelete, setPhotoToDelete] = React.useState<number | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setPhotos(existingPhotos)
    }, [existingPhotos])

    // Keyboard navigation
    const goToPrevious = React.useCallback(() => {
        setSelectedPhotoIndex((prev) => {
            if (prev === null) return prev
            return (prev - 1 + photos.length) % photos.length
        })
    }, [photos.length])

    const goToNext = React.useCallback(() => {
        setSelectedPhotoIndex((prev) => {
            if (prev === null) return prev
            return (prev + 1) % photos.length
        })
    }, [photos.length])

    React.useEffect(() => {
        if (selectedPhotoIndex === null) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                goToPrevious()
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                goToNext()
            } else if (e.key === 'Escape') {
                closeLightbox()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedPhotoIndex, photos.length, goToNext, goToPrevious])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        )
        handleFiles(files)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            handleFiles(files)
        }
    }

    const handleFiles = (files: File[]) => {
        // Validate file sizes (5MB limit)
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 5MB.`)
                return false
            }
            return true
        })
        setSelectedFiles(prev => [...prev, ...validFiles])
    }

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const uploadPhotos = async () => {
        if (selectedFiles.length === 0) return

        setUploading(true)
        try {
            const uploadPromises = selectedFiles.map(file =>
                ApiService.uploadSamplePhoto(sampleId, file)
            )

            const newPhotos = await Promise.all(uploadPromises)
            setPhotos(prev => [...prev, ...newPhotos])
            setSelectedFiles([])
            onPhotosChange?.()
        } catch (error) {
            console.error('Failed to upload photos:', error)
            alert('Failed to upload photos. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteClick = (photoId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setPhotoToDelete(photoId)
    }

    const confirmDelete = async () => {
        if (photoToDelete === null) return

        try {
            const photoId = photoToDelete
            const photoIndex = photos.findIndex(p => p.id === photoId)

            await ApiService.deleteSamplePhoto(photoId)
            setPhotos(prev => prev.filter(p => p.id !== photoId))

            // If we're in lightbox and deleting the current photo
            if (selectedPhotoIndex !== null) {
                if (photos.length === 1) {
                    // Last photo, close lightbox
                    closeLightbox()
                } else if (photoIndex === selectedPhotoIndex) {
                    // Deleting current photo, move to previous or keep same index
                    if (selectedPhotoIndex >= photos.length - 1) {
                        setSelectedPhotoIndex(selectedPhotoIndex - 1)
                    }
                } else if (photoIndex < selectedPhotoIndex) {
                    // Deleted photo before current, adjust index
                    setSelectedPhotoIndex(selectedPhotoIndex - 1)
                }
            }

            onPhotosChange?.()
            setPhotoToDelete(null)
        } catch (error) {
            console.error('Failed to delete photo:', error)
            alert('Failed to delete photo. Please try again.')
            setPhotoToDelete(null)
        }
    }

    const getThumbnailUrl = (url: string) => {
        return `${url}?tr=w-300,h-300,fo-auto,q-80`
    }

    const getFullSizeUrl = (url: string) => {
        return `${url}?tr=w-1600,h-1600,c-at_max,q-90`
    }

    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index)
    }

    const closeLightbox = () => {
        setSelectedPhotoIndex(null)
    }

    

    const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <Card>
                <CardContent className="pt-6">
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                            uploading && "opacity-50 pointer-events-none"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Drag and drop images here, or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                JPEG, PNG, GIF, WebP up to 5MB
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            Select Images
                        </Button>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    {selectedFiles.length} file(s) selected
                                </p>
                                <Button
                                    onClick={uploadPhotos}
                                    disabled={uploading}
                                    size="sm"
                                >
                                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Upload
                                </Button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <button
                                            onClick={() => removeSelectedFile(index)}
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <p className="text-xs truncate mt-1">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Existing Photos Grid */}
            {photos.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">
                        Photos ({photos.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="relative group cursor-pointer"
                                onClick={() => openLightbox(index)}
                            >
                                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={getThumbnailUrl(photo.url)}
                                        alt={photo.meta?.originalName || 'Sample photo'}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={(e) => handleDeleteClick(photo.id, e)}
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                    title="Delete photo"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <ZoomIn className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {photo.meta?.originalName}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {photos.length === 0 && selectedFiles.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No photos uploaded yet</p>
                </div>
            )}

            {/* Lightbox Modal */}
            {currentPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Photo counter */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                        {selectedPhotoIndex! + 1} / {photos.length}
                    </div>

                    {/* Previous button */}
                    {photos.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                goToPrevious()
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                    )}

                    {/* Image */}
                    <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={getFullSizeUrl(currentPhoto.url)}
                            alt={currentPhoto.meta?.originalName || 'Sample photo'}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Next button */}
                    {photos.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                goToNext()
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}

                    {/* Filename */}
                    {currentPhoto.meta?.originalName && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                            {currentPhoto.meta.originalName}
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the photo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
