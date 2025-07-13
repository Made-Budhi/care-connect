"use client"

import { useState, useEffect, useRef, type MouseEvent, type FC } from "react"
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, X } from "lucide-react"
import {useMediaQuery} from "@/lib/utils.ts";

interface ImageViewerProps {
    imageUrl: string
    imageAlt?: string
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

export const ImageViewer: FC<ImageViewerProps> = ({
                                                      imageUrl,
                                                      imageAlt = "Image Viewer",
                                                      isOpen,
                                                      onOpenChange
                                                  }) => {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)

    // Refs for performance optimization
    const imageElementRef = useRef<HTMLImageElement>(null);
    const dragStartRef = useRef<{startX: number, startY: number, startXTranslate: number, startYTranslate: number} | null>(null);

    // Reset zoom and position when the dialog is closed or image changes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setZoom(1)
                setPosition({ x: 0, y: 0 })
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen])

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => {
        setZoom(prev => {
            const newZoom = Math.max(prev - 0.2, 1);
            if (newZoom === 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
    }

    const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
        if (zoom > 1 && imageElementRef.current) {
            e.preventDefault();
            setIsDragging(true);
            dragStartRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startXTranslate: position.x,
                startYTranslate: position.y,
            };
            imageElementRef.current.style.cursor = 'grabbing';
            imageElementRef.current.style.transition = 'none'; // Disable transition during drag for responsiveness
        }
    };

    const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (isDragging && dragStartRef.current && imageElementRef.current) {
            const dx = e.clientX - dragStartRef.current.startX;
            const dy = e.clientY - dragStartRef.current.startY;

            const newX = dragStartRef.current.startXTranslate + dx / zoom;
            const newY = dragStartRef.current.startYTranslate + dy / zoom;

            // Directly manipulate the DOM for performance. No state updates here.
            imageElementRef.current.style.transform = `scale(${zoom}) translateX(${newX}px) translateY(${newY}px)`;
        }
    };

    const handleMouseUp = (e: globalThis.MouseEvent) => {
        if (isDragging && dragStartRef.current && imageElementRef.current) {
            // Re-enable transition after drag
            imageElementRef.current.style.transition = 'transform 0.2s';
            imageElementRef.current.style.cursor = 'grab';

            const dx = e.clientX - dragStartRef.current.startX;
            const dy = e.clientY - dragStartRef.current.startY;

            // Now, update the state once at the end of the drag.
            setPosition({
                x: dragStartRef.current.startXTranslate + dx / zoom,
                y: dragStartRef.current.startYTranslate + dy / zoom,
            });

            setIsDragging(false);
            dragStartRef.current = null;
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]);

    const ViewerContent = (
        <>
            <div className="overflow-hidden w-full h-full flex items-center justify-center">
                <img
                    ref={imageElementRef}
                    src={imageUrl}
                    alt={imageAlt}
                    className="max-w-full max-h-full object-contain"
                    style={{
                        transform: `scale(${zoom}) translateX(${position.x}px) translateY(${position.y}px)`,
                        cursor: zoom > 1 ? 'grab' : 'default',
                        transition: 'transform 0.2s', // Apply transition for smooth zoom
                    }}
                    onMouseDown={handleMouseDown}
                    // Prevent browser's default image drag behavior
                    onDragStart={(e) => e.preventDefault()}
                />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 p-2 rounded-lg shadow-lg">
                <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 1}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
            </div>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 rounded-full bg-background/50 hover:bg-background/80" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
            </Button>
        </>
    )

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogPortal>
                    <DialogOverlay />
                    <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center p-0 border-0 bg-transparent outline-none shadow-none">
                        {ViewerContent}
                    </DialogPrimitive.Content>
                </DialogPortal>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[90vh] p-4 bg-background">
                {ViewerContent}
            </DrawerContent>
        </Drawer>
    )
}