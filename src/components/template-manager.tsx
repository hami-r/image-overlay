
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getCustomTemplates, saveCustomTemplate, deleteCustomTemplate, type CustomTemplate } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// This is a simplified version of the drawing logic from other components.
// Its only purpose is to render previews and doesn't need to be fully-featured.
const drawOnCanvas = (canvas: HTMLCanvasElement, config: any) => {
    return new Promise<void>((resolve, reject) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context."));

        const {
            textLayers = [],
            background = "#FFFFFF",
            backgroundImage,
            width = 1280,
            height = 720,
        } = config;

        canvas.width = width;
        canvas.height = height;

        const drawBackground = new Promise<void>((bgResolve) => {
            if (backgroundImage) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    bgResolve();
                };
                img.onerror = () => {
                    // Don't reject, just draw a fallback color for previews.
                    ctx.fillStyle = '#E0E0E0';
                    ctx.fillRect(0, 0, width, height);
                    bgResolve();
                };
                img.src = backgroundImage;
            } else {
                ctx.fillStyle = background;
                if (background && background.includes('gradient')) {
                    const colors = background.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+\%\s*,\s*[\d.]+\%\s*\)/g);
                    if (colors && colors.length >= 2) {
                        const gradient = ctx.createLinearGradient(0, 0, width, height);
                        gradient.addColorStop(0, colors[0]);
                        gradient.addColorStop(1, colors[1]);
                        ctx.fillStyle = gradient;
                    }
                }
                ctx.fillRect(0, 0, width, height);
                bgResolve();
            }
        });

        drawBackground.then(() => {
            textLayers.forEach((layer: any) => {
                ctx.font = `${layer.fontSize || 64}px ${layer.fontFamily || 'sans-serif'}`;
                ctx.fillStyle = layer.textColor || '#000000';
                ctx.textAlign = layer.textAlign || 'center';
                const x = layer.x ?? width / 2;
                const y = layer.y ?? height / 2;
                ctx.fillText(layer.text, x, y);
            });
            resolve();
        }).catch(reject);
    });
};


const TemplatePreviewCard = ({ template, onDelete }: { template: CustomTemplate, onDelete: (name: string) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [config] = useState(() => {
        try {
            return JSON.parse(template.json)[0];
        } catch {
            return {};
        }
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            drawOnCanvas(canvas, config).catch(console.error);
        }
    }, [config]);

    return (
        <Card className="flex flex-col">
            <div className="p-4 bg-muted/50">
                <canvas
                    ref={canvasRef}
                    className="w-full shadow-md rounded-md bg-card-foreground/5"
                    style={{
                        aspectRatio: `${config.width || 1280} / ${config.height || 720}`
                    }}
                />
            </div>
            <CardHeader className="flex-grow">
                <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the &quot;{template.name}&quot; template. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(template.name)}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    );
};

export function TemplateManager() {
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        setCustomTemplates(getCustomTemplates());
    }, []);

    const handleDeleteTemplate = (name: string) => {
        deleteCustomTemplate(name);
        setCustomTemplates(getCustomTemplates());
        toast({
            title: "Template Deleted",
            description: `The "${name}" template has been removed.`,
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Template Library</CardTitle>
                    <CardDescription>
                        Manage your custom saved templates. These are stored in your browser&apos;s local storage.
                    </CardDescription>
                </CardHeader>
            </Card>

            {customTemplates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customTemplates.map(template => (
                        <TemplatePreviewCard key={template.name} template={template} onDelete={handleDeleteTemplate} />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-12">
                    <CardHeader>
                        <CardTitle>No Custom Templates Found</CardTitle>
                        <CardDescription>
                            You haven&apos;t saved any custom templates yet. Go to the Batch Create page, configure an image using the JSON editor, and use the &quot;Save as Template&quot; button to create your first one.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
