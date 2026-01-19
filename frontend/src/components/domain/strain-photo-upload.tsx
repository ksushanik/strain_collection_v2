"use client"

import * as React from "react"
import Image from "next/image"
import { Upload, X, Loader2, ImageIcon, ZoomIn, ChevronLeft, ChevronRight, Trash, Pencil, Star } from "lucide-react"
import { ApiService, StrainPhoto } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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

interface StrainPhotoUploadProps {
    strainId: number
    existingPhotos?: StrainPhoto[]
    onPhotosChange?: () => void
    readOnly?: boolean
}

export function StrainPhotoUpload({ strainId, existingPhotos = [], onPhotosChange, readOnly = false }: StrainPhotoUploadProps) {
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const [photos, setPhotos] = React.useState<StrainPhoto[]>(existingPhotos)
    const [uploading, setUploading] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const [dragActive, setDragActive] = React.useState(false)
    const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | null>(null)
    const [photoToDelete, setPhotoToDelete] = React.useState<number | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [loadedPreview, setLoadedPreview] = React.useState<Record<number, boolean>>({})
    const [fullLoaded, setFullLoaded] = React.useState(false)
    const [photoToRename, setPhotoToRename] = React.useState<StrainPhoto | null>(null)
    const [renameValue, setRenameValue] = React.useState("")
    const [savingRename, setSavingRename] = React.useState(false)
    const [settingPrimary, setSettingPrimary] = React.useState<number | null>(null)

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
                alert(tCommon('fileTooLarge', { name: file.name }))
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
                ApiService.uploadStrainPhoto(strainId, file)
            )

            const newPhotos = await Promise.all(uploadPromises)
            setPhotos(prev => {
                const combined = [...prev, ...newPhotos]
                const primary = combined.find((photo) => photo.isPrimary) ?? combined[0]
                if (!primary) return combined
                return combined.map((photo) => ({
                    ...photo,
                    isPrimary: photo.id === primary.id,
                }))
            })
            setSelectedFiles([])
            onPhotosChange?.()
        } catch (error) {
            console.error('Failed to upload photos:', error)
            const message =
                typeof error === 'object' && error !== null && 'message' in error
                    ? String((error as { message?: string }).message || '')
                    : ''
            alert(message || tCommon('uploadFailed'))
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteClick = (photoId: number, e: React.MouseEvent) => {
        if (readOnly) return
        e.stopPropagation()
        setPhotoToDelete(photoId)
    }

    const confirmDelete = async () => {
        if (photoToDelete === null) return

        try {
            const photoId = photoToDelete
            const photoIndex = photos.findIndex(p => p.id === photoId)

            await ApiService.deleteStrainPhoto(photoId)
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
            alert(tCommon('deleteFailed'))
            setPhotoToDelete(null)
        }
    }

    const openRenameDialog = (photo: StrainPhoto, e: React.MouseEvent) => {
        if (readOnly) return
        e.stopPropagation()
        setPhotoToRename(photo)
        setRenameValue(photo.meta?.originalName || "")
    }

    const closeRenameDialog = () => {
        setPhotoToRename(null)
        setRenameValue("")
    }

    const confirmRename = async () => {
        if (!photoToRename) return
        const trimmed = renameValue.trim()
        if (!trimmed) return
        setSavingRename(true)
        try {
            const updated = await ApiService.updateStrainPhoto(photoToRename.id, { name: trimmed })
            setPhotos((prev) =>
                prev.map((p) =>
                    p.id === updated.id ? { ...p, meta: updated.meta } : p
                )
            )
            onPhotosChange?.()
            closeRenameDialog()
        } catch (error) {
            console.error('Failed to rename photo:', error)
            alert(t('renamePhotoFailed'))
        } finally {
            setSavingRename(false)
        }
    }

    const handleSetPrimary = async (photoId: number, e: React.MouseEvent) => {
        if (readOnly) return
        e.stopPropagation()
        setSettingPrimary(photoId)
        try {
            const updated = await ApiService.updateStrainPhoto(photoId, { isPrimary: true })
            setPhotos((prev) =>
                prev.map((p) =>
                    p.id === updated.id ? { ...p, isPrimary: true, meta: updated.meta } : { ...p, isPrimary: false }
                )
            )
            onPhotosChange?.()
        } catch (error) {
            console.error('Failed to set avatar:', error)
            alert(t('setAvatarFailed'))
        } finally {
            setSettingPrimary(null)
        }
    }

    const getThumbnailUrl = (url: string) => {
        return `${url}?tr=w-300,h-300,fo-auto,q-80`
    }

    const getFullSizeUrl = (url: string) => {
        return `${url}?tr=w-1600,h-1600,c-at_max,q-90`
    }

    const getBlurThumbnailUrl = (url: string) => {
        return `${url}?tr=w-40,h-40,bl-20,q-20,fo-auto`
    }

    const getBlurFullUrl = (url: string) => {
        return `${url}?tr=w-800,h-800,bl-30,q-20,c-at_max`
    }

    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index)
        setFullLoaded(false)
    }

    const handleOpenLightbox = (index: number, e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-photo-action]')) return
        openLightbox(index)
    }

    const closeLightbox = () => {
        setSelectedPhotoIndex(null)
    }



    const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            {!readOnly && (
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
                                    {tCommon('dragDrop')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {tCommon('fileTypes')}
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
                                {tCommon('selectImages')}
                            </Button>
                        </div>

                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {selectedFiles.length} {tCommon('filesSelected')}
                                    </p>
                                    <Button
                                        onClick={uploadPhotos}
                                        disabled={uploading}
                                        size="sm"
                                    >
                                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {tCommon('upload')}
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
            )}

            {/* Existing Photos Grid */}
            {photos.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">
                        {tCommon('photos')} ({photos.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className="relative group cursor-pointer"
                                onClick={(e) => handleOpenLightbox(index, e)}
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                    <div
                                        className={`absolute inset-0 bg-center bg-cover filter blur-sm scale-105 transition-opacity ${loadedPreview[photo.id] ? 'opacity-0' : 'opacity-100'}`}
                                        style={{ backgroundImage: `url(${getBlurThumbnailUrl(photo.url)})` }}
                                        aria-hidden
                                    />
                                    <Image
                                        src={getThumbnailUrl(photo.url)}
                                        alt={photo.meta?.originalName || t('strainPhotoAlt')}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105 opacity-0"
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        onLoadingComplete={(img) => {
                                            img.classList.remove('opacity-0')
                                            setLoadedPreview((prev) => ({ ...prev, [photo.id]: true }))
                                        }}
                                    />
                                </div>
                                <div className="absolute top-2 left-2 flex gap-2">
                                    {!readOnly && (
                                        <Button
                                            data-photo-action
                                            variant={photo.isPrimary ? "default" : "secondary"}
                                            size="icon"
                                            onClick={(e) => handleSetPrimary(photo.id, e)}
                                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                            title={photo.isPrimary ? t('avatar') : t('makeAvatar')}
                                            disabled={settingPrimary === photo.id}
                                        >
                                            {settingPrimary === photo.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Star className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                    {!readOnly && (
                                        <span className="pointer-events-none rounded bg-black/60 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {photo.isPrimary ? t('avatar') : t('makeAvatar')}
                                        </span>
                                    )}
                                </div>
                                {!readOnly && (
                                    <Button
                                        data-photo-action
                                        variant="destructive"
                                        size="icon"
                                        onClick={(e) => handleDeleteClick(photo.id, e)}
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                        title={tCommon('deletePhoto')}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                )}
                                {!readOnly && (
                                    <Button
                                        data-photo-action
                                        variant="secondary"
                                        size="icon"
                                        onClick={(e) => openRenameDialog(photo, e)}
                                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                        title={t('renamePhotoTitle')}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                                    <ZoomIn className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate">
                                            {photo.meta?.originalName}
                                        </span>
                                        {photo.isPrimary && (
                                            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
                                                {t('avatar')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {photos.length === 0 && selectedFiles.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>{tCommon('noPhotos')}</p>
                </div>
            )}

            {/* Lightbox Modal */}
            {currentPhoto && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
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
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full">
                        <div
                            className={`absolute inset-0 bg-center bg-contain bg-no-repeat filter blur-md scale-105 transition-opacity ${fullLoaded ? 'opacity-0' : 'opacity-100'}`}
                            style={{ backgroundImage: `url(${getBlurFullUrl(currentPhoto.url)})` }}
                            aria-hidden
                        />
                        <Image
                            src={getFullSizeUrl(currentPhoto.url)}
                            alt={currentPhoto.meta?.originalName || t('strainPhotoAlt')}
                            fill
                            className="object-contain rounded-lg opacity-0"
                            sizes="100vw"
                            onLoadingComplete={(img) => {
                                img.classList.remove('opacity-0')
                                setFullLoaded(true)
                            }}
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

            {!readOnly && (
                <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{tCommon('areYouSure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {tCommon('deletePhotoConfirm')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
                                {tCommon('delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {!readOnly && (
                <Dialog open={!!photoToRename} onOpenChange={(open) => !open && closeRenameDialog()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('renamePhotoTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('renamePhotoDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            placeholder={t('photoNamePlaceholder')}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={closeRenameDialog} disabled={savingRename}>
                                {tCommon('cancel')}
                            </Button>
                            <Button onClick={confirmRename} disabled={savingRename || !renameValue.trim()}>
                                {savingRename && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tCommon('save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
