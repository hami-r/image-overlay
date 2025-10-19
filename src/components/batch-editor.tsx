


"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Code, Bot, AlertTriangle, Sparkles, Trash2, PlusCircle, FormInput, Shuffle, Upload, Link, Copy, CheckSquare, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateBatchJson } from '@/ai/flows/generate-batch-json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fontFamilies } from '@/lib/fonts';
import { backgroundPatterns } from '@/lib/backgrounds';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { generateBackgroundImage } from '@/ai/flows/generate-background-image';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
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
import { imageTemplates, getCustomTemplates, saveCustomTemplate, type CustomTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';

const AIBackgroundGenerator = ({ index, onGenerate, isGenerating }: { index: number, onGenerate: (prompt: string) => void, isGenerating: boolean }) => {
    const [prompt, setPrompt] = useState('A beautiful sunset over mountains');
    
    return (
        <div className="pt-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor={`ai-prompt-${index}`}>AI Prompt</Label>
                <Input
                    id={`ai-prompt-${index}`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic cityscape at night"
                    disabled={isGenerating}
                />
                 <p className="text-xs text-muted-foreground">Describe the background you want to generate.</p>
            </div>
            <Button onClick={() => onGenerate(prompt)} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                    <>
                        <Bot className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Background
                    </>
                )}
            </Button>
        </div>
    )
};

const URLBackgroundInput = ({ index, onSetUrl }: { index: number, onSetUrl: (url: string) => void }) => {
    const [url, setUrl] = useState('');
    return (
         <div className="pt-4 space-y-2">
            <Label htmlFor={`url-input-${index}`}>Image URL</Label>
            <div className="flex gap-2">
                <Input id={`url-input-${index}`} type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
                <Button onClick={() => onSetUrl(url)}><Link className="w-4 h-4" /></Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Note: Images from other websites may be subject to CORS restrictions.
            </p>
        </div>
    )
}

const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center-left', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
];

const BatchItem = ({ config, index, onConfigChange, onRemove, onRandomBackground, onImageUpload, onImageUrl, onAiGenerateImage, generatingAiImageIndex, onApplyStylesToAll }: { 
    config: any, 
    index: number, 
    onConfigChange: (field: string, value: any, layerId?: number) => void, 
    onRemove: () => void,
    onRandomBackground: () => void,
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onImageUrl: (url: string) => void,
    onAiGenerateImage: (prompt: string) => void,
    generatingAiImageIndex: number | null,
    onApplyStylesToAll: () => void
}) => {
    const isGeneratingThis = generatingAiImageIndex === index;
    const { textLayers = [] } = config;

    const addLayer = () => {
        const newLayer = {
            id: Date.now(),
            text: 'New Layer',
            textColor: '#000000',
            fontSize: 64,
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            layout: { position: 'center' },
            x: undefined,
            y: undefined,
        };
        onConfigChange('textLayers', [...textLayers, newLayer]);
    }
    
    const removeLayer = (layerId: number) => {
        if (textLayers.length > 1) {
            onConfigChange('textLayers', textLayers.filter((l: any) => l.id !== layerId));
        }
    }

    const handlePositioningModeChange = (layerId: number, mode: 'auto' | 'manual') => {
        const newLayers = config.textLayers.map((l: any) => {
            if (l.id === layerId) {
                const newLayer = {...l};
                if (mode === 'auto') {
                    newLayer.layout = { position: newLayer.layout?.position || 'center' };
                    delete newLayer.x;
                    delete newLayer.y;
                } else { // manual
                    delete newLayer.layout;
                    newLayer.x = l.x ?? config.width / 2;
                    newLayer.y = l.y ?? config.height / 2;
                }
                return newLayer;
            }
            return l;
        });
        onConfigChange('textLayers', newLayers);
    }
    
    const handleLayoutPositionChange = (layerId: number, position: string) => {
        const newLayers = config.textLayers.map((l: any) => {
            if (l.id === layerId) {
                return {...l, layout: { position }};
            }
            return l;
        });
        onConfigChange('textLayers', newLayers);
    }

    return (
        <AccordionItem value={`item-${index}`}>
            <AccordionTrigger>
                <span className="truncate">Image {index + 1}: {textLayers[0]?.text || "Untitled"}</span>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 p-4 pr-2">
                    <Accordion type="multiple" defaultValue={[`layer-0`]} className="w-full">
                        {textLayers.map((layer: any, layerIndex: number) => {
                           const positioningMode = layer.layout?.position ? 'auto' : 'manual';
                           return (
                           <AccordionItem key={layer.id || layerIndex} value={`layer-${layerIndex}`}>
                                <AccordionTrigger>Layer {layerIndex + 1}: {layer.text}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                     <div className="space-y-2">
                                        <Label htmlFor={`text-${index}-${layerIndex}`}>Text</Label>
                                        <Textarea id={`text-${index}-${layerIndex}`} value={layer.text} onChange={(e) => onConfigChange('text', e.target.value, layer.id)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`text-color-${index}-${layerIndex}`}>Text Color</Label>
                                            <Input id={`text-color-${index}-${layerIndex}`} type="color" value={layer.textColor || '#000000'} onChange={(e) => onConfigChange('textColor', e.target.value, layer.id)} className="p-1 h-10"/>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Font</Label>
                                        <Select value={layer.fontFamily} onValueChange={(v) => onConfigChange('fontFamily', v, layer.id)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                {fontFamilies.map(f => <SelectItem key={f.name} value={f.family} style={{fontFamily: f.family}}>{f.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Positioning</Label>
                                        <ToggleGroup type="single" value={positioningMode} onValueChange={(mode: 'auto' | 'manual') => mode && handlePositioningModeChange(layer.id, mode)} className="w-full">
                                            <ToggleGroupItem value="auto" className="w-full">Auto</ToggleGroupItem>
                                            <ToggleGroupItem value="manual" className="w-full">Manual</ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>

                                    {positioningMode === 'auto' ? (
                                        <div className="space-y-2">
                                            <Label htmlFor={`layer-position-${index}-${layer.id}`}>Position</Label>
                                            <Select value={layer.layout?.position} onValueChange={(v) => handleLayoutPositionChange(layer.id, v)}>
                                                <SelectTrigger id={`layer-position-${index}-${layer.id}`}><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {positionOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`layer-x-${index}-${layerIndex}`}>Position X</Label>
                                                <Input id={`layer-x-${index}-${layerIndex}`} type="number" placeholder={`${config.width/2 || 640}`} value={layer.x ?? ''} onChange={(e) => onConfigChange('x', e.target.value, layer.id)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`layer-y-${index}-${layerIndex}`}>Position Y</Label>
                                                <Input id={`layer-y-${index}-${layerIndex}`} type="number" placeholder={`${config.height/2 || 360}`} value={layer.y ?? ''} onChange={(e) => onConfigChange('y', e.target.value, layer.id)} />
                                            </div>
                                        </div>
                                    )}


                                    <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                            <Label htmlFor={`font-size-${index}-${layerIndex}`}>Font Size</Label>
                                            <Input id={`font-size-${index}-${layerIndex}`} type="number" value={layer.fontSize ?? ''} onChange={(e) => onConfigChange('fontSize', e.target.value, layer.id)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Alignment</Label>
                                            <ToggleGroup type="single" value={layer.textAlign} onValueChange={(v) => v && onConfigChange('textAlign', v, layer.id)} className="w-full">
                                                <ToggleGroupItem value="left" className="w-full"><AlignLeft/></ToggleGroupItem>
                                                <ToggleGroupItem value="center" className="w-full"><AlignCenter/></ToggleGroupItem>
                                                <ToggleGroupItem value="right" className="w-full"><AlignRight/></ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    </div>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="advanced-style">
                                            <AccordionTrigger>Advanced Styling</AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label>Letter Spacing: {layer.letterSpacing || 0}px</Label>
                                                    <Slider value={[layer.letterSpacing || 0]} onValueChange={([val]) => onConfigChange('letterSpacing', val, layer.id)} min={-10} max={50} step={1} />
                                                </div>
                                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <Label>Text Background</Label>
                                                    </div>
                                                    <Switch checked={layer.addTextBackground} onCheckedChange={(checked) => onConfigChange('addTextBackground', checked, layer.id)} />
                                                </div>
                                                {layer.addTextBackground && (
                                                    <div className="space-y-2 border p-3 rounded-lg">
                                                        <Label htmlFor={`text-bg-color-${index}-${layerIndex}`}>BG Color</Label>
                                                        <Input id={`text-bg-color-${index}-${layerIndex}`} type="color" value={layer.textBackgroundColor || '#000000'} onChange={(e) => onConfigChange('textBackgroundColor', e.target.value, layer.id)} className="p-1 h-10"/>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <Label>Text Stroke</Label>
                                                    </div>
                                                    <Switch checked={layer.textStrokeWidth > 0} onCheckedChange={(checked) => onConfigChange('textStrokeWidth', checked ? 2 : 0, layer.id)} />
                                                </div>
                                                {layer.textStrokeWidth > 0 && (
                                                    <div className="space-y-4 border p-3 rounded-lg">
                                                        <div className="space-y-2">
                                                            <Label>Stroke Width: {layer.textStrokeWidth}px</Label>
                                                            <Slider value={[layer.textStrokeWidth]} onValueChange={([val]) => onConfigChange('textStrokeWidth', val, layer.id)} min={0} max={20} step={1} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`text-stroke-color-${index}-${layerIndex}`}>Stroke Color</Label>
                                                            <Input id={`text-stroke-color-${index}-${layerIndex}`} type="color" value={layer.textStrokeColor || '#000000'} onChange={(e) => onConfigChange('textStrokeColor', e.target.value, layer.id)} className="p-1 h-10"/>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <Label>Text Shadow</Label>
                                                    </div>
                                                    <Switch checked={layer.addTextShadow} onCheckedChange={(checked) => onConfigChange('addTextShadow', checked, layer.id)} />
                                                </div>
                                                {layer.addTextShadow && (
                                                    <div className="space-y-4 border p-3 rounded-lg">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`text-shadow-color-${index}-${layerIndex}`}>Shadow Color</Label>
                                                            <Input id={`text-shadow-color-${index}-${layerIndex}`} type="color" value={layer.textShadowColor || '#000000'} onChange={(e) => onConfigChange('textShadowColor', e.target.value, layer.id)} className="p-1 h-10"/>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Shadow Blur: {layer.textShadowBlur || 10}px</Label>
                                                            <Slider value={[layer.textShadowBlur || 10]} onValueChange={([val]) => onConfigChange('textShadowBlur', val, layer.id)} min={0} max={50} step={1} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Offset X: {layer.textShadowOffsetX || 5}px</Label>
                                                                <Slider value={[layer.textShadowOffsetX || 5]} onValueChange={([val]) => onConfigChange('textShadowOffsetX', val, layer.id)} min={-20} max={20} step={1} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Offset Y: {layer.textShadowOffsetY || 5}px</Label>
                                                                <Slider value={[layer.textShadowOffsetY || 5]} onValueChange={([val]) => onConfigChange('textShadowOffsetY', val, layer.id)} min={-20} max={20} step={1} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    <Button variant="outline" size="sm" onClick={() => removeLayer(layer.id)}><Trash2 className="h-4 w-4 mr-2"/> Remove Layer</Button>
                                </AccordionContent>
                           </AccordionItem>
                        )})}
                    </Accordion>
                    <Button variant="outline" onClick={addLayer}><PlusCircle className="h-4 w-4 mr-2"/> Add Text Layer</Button>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Background</Label>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRandomBackground}>
                                <Shuffle className="w-4 h-4"/>
                            </Button>
                        </div>
                        <Tabs defaultValue="pattern" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="pattern">Color</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                <TabsTrigger value="url">URL</TabsTrigger>
                                <TabsTrigger value="ai">AI</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pattern" className="pt-4">
                                <Input id={`bg-color-${index}`} value={config.background ?? ''} onChange={(e) => onConfigChange('background', e.target.value)} />
                                <div className="grid grid-cols-5 gap-1 pt-2">
                                    {backgroundPatterns.map(p => (
                                        <button key={p.name} title={p.name} onClick={() => onConfigChange('background', p.value)} className={`w-full h-6 rounded-sm border-2 ${config.background === p.value ? 'border-ring' : 'border-transparent'}`} style={{background: p.value}} />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="upload" className="pt-4">
                                <Label htmlFor={`image-upload-${index}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                    </div>
                                    <Input id={`image-upload-${index}`} type="file" className="hidden" onChange={onImageUpload} accept="image/*"/>
                                </Label>
                            </TabsContent>
                            <TabsContent value="url">
                                <URLBackgroundInput index={index} onSetUrl={onImageUrl} />
                            </TabsContent>
                            <TabsContent value="ai">
                                <AIBackgroundGenerator index={index} onGenerate={onAiGenerateImage} isGenerating={isGeneratingThis} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor={`width-${index}`}>Width</Label>
                            <Input id={`width-${index}`} type="number" value={config.width ?? ''} onChange={(e) => onConfigChange('width', e.target.value)} />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor={`height-${index}`}>Height</Label>
                            <Input id={`height-${index}`} type="number" value={config.height ?? ''} onChange={(e) => onConfigChange('height', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={onRemove}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                        <Button variant="outline" size="sm" onClick={onApplyStylesToAll}>
                            <Copy className="mr-2 h-4 w-4" /> Apply to All
                        </Button>
                    </div>

                    </div>
            </AccordionContent>
        </AccordionItem>
    );
};

const drawOnCanvas = (canvas: HTMLCanvasElement, config: any) => {
    return new Promise<void>((resolve, reject) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context."));

        const dpr = config.dpr || 1;
        
        const {
            textLayers = [],
            background = "#FFFFFF",
            backgroundImage,
            width = 1280,
            height = 720,
        } = config;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        const drawBackground = new Promise<void>((bgResolve) => {
            if (backgroundImage) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    bgResolve();
                };
                img.onerror = () => {
                    reject(new Error(`Failed to load image from ${backgroundImage.substring(0,100)}... Check URL and CORS policy.`));
                };
                img.src = backgroundImage;
            } else {
                ctx.fillStyle = background;
                if (background && background.includes('gradient')) {
                    const colors = background.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+\%\s*,\s*[\d.]+\%\s*\)/g);
                    if (colors && colors.length >= 2) {
                        const directionMatch = background.match(/to (right|left|bottom|top|bottom right|bottom left|top left|top right)/);
                        const direction = directionMatch ? directionMatch[1] : 'right';
                        let gradient;

                        if (direction === 'right') gradient = ctx.createLinearGradient(0, 0, width, 0);
                        else if (direction === 'left') gradient = ctx.createLinearGradient(width, 0, 0, 0);
                        else if (direction === 'bottom') gradient = ctx.createLinearGradient(0, 0, 0, height);
                        else if (direction === 'bottom right') gradient = ctx.createLinearGradient(0, 0, width, height);
                        else if (direction === 'bottom left') gradient = ctx.createLinearGradient(width, 0, 0, height);
                        else if (direction === 'top left') gradient = ctx.createLinearGradient(width, height, 0, 0);
                        else if (direction === 'top right') gradient = ctx.createLinearGradient(0, height, width, 0);
                        else gradient = ctx.createLinearGradient(0, height, 0, 0);

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
            const layersToDraw = [...textLayers];
            
            layersToDraw.forEach((layer: any) => {
                const {
                    text = "", textColor = '#000000', fontSize = 64, fontFamily = "'Inter', sans-serif",
                    textAlign = 'center', letterSpacing = 0, addTextShadow = false,
                    textShadowColor = 'rgba(0,0,0,0.5)', textShadowBlur = 10,
                    textShadowOffsetX = 5, textShadowOffsetY = 5, textStrokeWidth = 0,
                    textStrokeColor = '#000000', addTextBackground = false, textBackgroundColor = 'rgba(0,0,0,0.5)',
                } = layer;

                ctx.font = `${fontSize}px ${fontFamily}`;
                ctx.fillStyle = textColor;
                ctx.textAlign = textAlign as CanvasTextAlign;
                ctx.letterSpacing = `${letterSpacing}px`;
                ctx.textBaseline = 'middle';

                if (addTextShadow) {
                    ctx.shadowColor = textShadowColor; ctx.shadowBlur = textShadowBlur;
                    ctx.shadowOffsetX = textShadowOffsetX; ctx.shadowOffsetY = textShadowOffsetY;
                } else {
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
                }
                
                const lineHeight = fontSize * 1.2;
                let autoX = width / 2;
                let autoY = height / 2;
                if (layer.x === undefined && layer.y === undefined) {
                    const marginX = width * 0.1;
                    autoX = textAlign === 'left' ? marginX : (textAlign === 'right' ? width - marginX : width / 2);
                }
                const maxWidth = width - (width * 0.1);

                const manualLines = text.split('\n');
                let wrappedLines: string[] = [];
                manualLines.forEach(line => {
                    let currentLine = '';
                    const words = line.split(' ');
                    for (const word of words) {
                        const testLine = currentLine + word + ' ';
                        if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
                            wrappedLines.push(currentLine.trim());
                            currentLine = word + ' ';
                        } else {
                            currentLine = testLine;
                        }
                    }
                    wrappedLines.push(currentLine.trim());
                });

                const totalLayerHeight = wrappedLines.length * lineHeight;
                
                let x, y;
                 if (layer.layout?.position) {
                    const margin = width * 0.05; // 5% margin
                    const [yPos, xPos] = layer.layout.position.split('-');
                    
                    if (yPos === 'top') y = margin + totalLayerHeight / 2;
                    else if (yPos === 'bottom') y = height - margin - totalLayerHeight / 2;
                    else y = height / 2;

                    if (xPos === 'left') x = margin;
                    else if (xPos === 'right') x = width - margin;
                    else x = width / 2;
                    
                    if (textAlign !== xPos) ctx.textAlign = xPos as CanvasTextAlign;

                } else if (layer.x !== undefined && layer.y !== undefined) {
                    x = layer.x;
                    y = layer.y;
                } else { // Auto-stacking for layers without any position info
                    const otherLayersHeight = layersToDraw.filter(l => l.id !== layer.id).reduce((acc, l) => {
                        ctx.font = `${l.fontSize || 64}px ${l.fontFamily || "'Inter', sans-serif"}`;
                        const lines = l.text.split('\n').length;
                        return acc + (lines * (l.fontSize || 64) * 1.2);
                    }, 0);
                    
                    const totalHeight = layersToDraw.reduce((acc, l) => {
                         ctx.font = `${l.fontSize || 64}px ${l.fontFamily || "'Inter', sans-serif"}`;
                        const lines = l.text.split('\n').length;
                        return acc + (lines * (l.fontSize || 64) * 1.2);
                    }, 0);
                    
                    let yOffset = (height - totalHeight) / 2;

                    for (const l of layersToDraw) {
                        ctx.font = `${l.fontSize || 64}px ${l.fontFamily || "'Inter', sans-serif"}`;
                        const lines = l.text.split('\n').length;
                        const layerHeight = (lines * (l.fontSize || 64) * 1.2);
                        if (l.id === layer.id) {
                            y = yOffset + layerHeight / 2;
                            break;
                        }
                        yOffset += layerHeight;
                    }
                    x = autoX;
                }
                
                let startY = y - (totalLayerHeight / 2);
                
                wrappedLines.forEach((line: string, lineIndex: number) => {
                    const currentLineY = startY + (lineIndex * lineHeight) + (lineHeight / 2);
                    let lineX = x;

                    if (textAlign === 'left') {
                        lineX = (layer.layout?.position?.includes('left')) ? x : (width - maxWidth) / 2;
                    } else if (textAlign === 'right') {
                         lineX = (layer.layout?.position?.includes('right')) ? x : width - (width - maxWidth) / 2;
                    }
                    
                    if (addTextBackground) {
                        const textMetrics = ctx.measureText(line);
                        const bgPadding = fontSize / 4;
                        let textWidth = textMetrics.width;

                        const currentShadow = { c: ctx.shadowColor, b: ctx.shadowBlur, x: ctx.shadowOffsetX, y: ctx.shadowOffsetY };
                        ctx.shadowColor = 'transparent';
                        ctx.fillStyle = textBackgroundColor;

                        let rectX;
                        if (ctx.textAlign === 'left') rectX = lineX - bgPadding;
                        else if (ctx.textAlign === 'right') rectX = lineX - textWidth - bgPadding;
                        else rectX = lineX - textWidth / 2 - bgPadding;
                        
                        const rectY = currentLineY - (lineHeight/2) - bgPadding/2;
                        ctx.fillRect(rectX, rectY, textWidth + bgPadding * 2, lineHeight + bgPadding);
                        
                        ctx.shadowColor = currentShadow.c; ctx.shadowBlur = currentShadow.b; ctx.shadowOffsetX = currentShadow.x; ctx.shadowOffsetY = currentShadow.y;
                        ctx.fillStyle = textColor;
                    }

                    if (textStrokeWidth > 0) {
                        ctx.strokeStyle = textStrokeColor;
                        ctx.lineWidth = textStrokeWidth;
                        ctx.strokeText(line, lineX, currentLineY);
                    }
                    ctx.fillText(line, lineX, currentLineY);
                });
            });
            resolve();
        }).catch(reject);
    });
};

const TemplatePreview = ({ template }: { template: { name: string, json: string } }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [config] = useState(() => JSON.parse(template.json)[0]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            drawOnCanvas(canvas, {
                ...config,
                dpr: 1, // Lower DPR for previews
            }).catch(console.error);
        }
    }, [config]);

    return (
        <div className="flex flex-col gap-2">
            <canvas 
                ref={canvasRef} 
                className="w-full shadow-lg rounded-md bg-card-foreground/5"
                style={{
                    aspectRatio: `${config.width || 1280} / ${config.height || 720}`
                }}
            />
            <p className="text-sm font-medium text-center">{template.name}</p>
        </div>
    );
};


export function BatchEditor() {
    const [jsonInput, setJsonInput] = useState('[\n  \n]');
    const [configs, setConfigs] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingJson, setIsGeneratingJson] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('Create 3 images for a motivational social media post');
    const [generatingAiImageIndex, setGeneratingAiImageIndex] = useState<number | null>(null);
    
    // State for "Apply to All"
    const [globalBackground, setGlobalBackground] = useState('');
    const [globalFontFamily, setGlobalFontFamily] = useState('');
    const [globalWidth, setGlobalWidth] = useState(1280);
    const [globalHeight, setGlobalHeight] = useState(720);
    const [globalTextColor, setGlobalTextColor] = useState("#000000");

    // State for "Apply styles from item"
    const [applyStylesDialogOpen, setApplyStylesDialogOpen] = useState(false);
    const [styleSourceIndex, setStyleSourceIndex] = useState<number | null>(null);
    
    // State for Template Dialog
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

    const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");


    const { toast } = useToast();

    useEffect(() => {
        setCustomTemplates(getCustomTemplates());
    }, []);

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (Array.isArray(parsed)) {
                setConfigs(parsed.map(c => ({...c, textLayers: c.textLayers && c.textLayers.length > 0 ? c.textLayers.map((l: any, i: number) => ({...l, id: l.id || Date.now() + i})) : [{ text: c.text || "Missing Text", id: Date.now() }]})));
                setJsonError(null);
            } else {
                setJsonError("Invalid JSON: Input must be an array of objects.");
                setConfigs([]);
            }
        } catch (error: any) {
            setJsonError("Invalid JSON: " + error.message);
        }
    }, [jsonInput]);

    useEffect(() => {
        if (!jsonError) {
             const newJson = JSON.stringify(configs, (key, value) => {
                if (key === 'id') return undefined;
                if (value === undefined) return undefined;
                if (key === 'layout' && value && Object.keys(value).length === 0) return undefined;
                return value;
             }, 2);
             if (newJson !== jsonInput) {
                 try {
                    const parsedInput = JSON.parse(jsonInput);
                    const cleanParsedInput = JSON.parse(JSON.stringify(parsedInput, (key, value) => key === 'id' ? undefined : value));
                    if (JSON.stringify(cleanParsedInput, null, 2) !== JSON.stringify(configs, (key, value) => key === 'id' ? undefined : value, 2)) {
                       setJsonInput(newJson);
                    }
                 } catch (e) {
                     setJsonInput(newJson);
                 }
             }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configs]);


    const handleGenerateImages = async () => {
        if (jsonError) {
             toast({
                variant: "destructive",
                title: "Invalid JSON",
                description: "Please fix the JSON errors before generating images.",
            });
            return;
        }
        if (configs.length === 0) {
            toast({
                variant: "destructive",
                title: "No Images to Generate",
                description: "Please add at least one image configuration.",
            });
            return;
        }

        setIsGenerating(true);

        for (let i = 0; i < configs.length; i++) {
            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                await generateAndDownload(configs[i], i + 1);
                toast({
                    title: `Generated Image ${i + 1}/${configs.length}`,
                    description: `Downloading image_${i + 1}.png`,
                });
            } catch (error: any)
             {
                toast({
                    variant: "destructive",
                    title: `Error generating image ${i + 1}`,
                    description: error.message,
                });
            }
        }

        setIsGenerating(false);
    };
    
    const handleGenerateJson = async () => {
        if (!aiPrompt.trim()) {
            toast({
                variant: "destructive",
                title: "Prompt is empty",
                description: "Please enter a prompt to generate the JSON.",
            });
            return;
        }

        setIsGeneratingJson(true);
        try {
            const result = await generateBatchJson({ prompt: aiPrompt });
            const parsedJson = JSON.parse(result.json);
            setJsonInput(JSON.stringify(parsedJson, null, 2));
            setConfigs(parsedJson);
            toast({
                title: "JSON Generated",
                description: "The configuration has been updated with the AI's response.",
            });
        } catch (error: any) {
             if (error instanceof SyntaxError) {
                toast({
                    variant: 'destructive',
                    title: 'AI Generation Failed',
                    description: 'The AI returned invalid JSON. Please try again or refine your prompt.',
                });
             } else {
                console.error("AI JSON Generation Error:", error);
                const description = error.message.includes('JSON.parse')
                    ? "The AI returned invalid JSON. Please try again."
                    : error.message || "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "AI Generation Failed",
                    description: description,
                });
             }
        } finally {
            setIsGeneratingJson(false);
        }
    };

    const generateAndDownload = async (config: any, index: number) => {
        const canvas = document.createElement('canvas');
        await drawOnCanvas(canvas, {
            ...config,
            dpr: window.devicePixelRatio || 2,
        });

        const link = document.createElement('a');
        link.download = `image_${index}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleConfigChange = (index: number, field: string, value: any, layerId?: number) => {
        setConfigs(prevConfigs => {
            const newConfigs = [...prevConfigs];
            let newConfig = { ...newConfigs[index] };
    
            if (layerId !== undefined) {
                newConfig.textLayers = newConfig.textLayers.map((l: any) => {
                    if (l.id === layerId) {
                        const newLayer = { ...l };
                        if (["fontSize", "letterSpacing", "textStrokeWidth", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"].includes(field)) {
                            newLayer[field] = value === '' ? undefined : Number(value);
                        } else if (["x", "y"].includes(field)) {
                            newLayer[field] = value === '' ? undefined : Number(value);
                        } else if (field === 'textLayers') {
                            return value;
                        }
                        else {
                            newLayer[field] = value;
                        }
                        return newLayer;
                    }
                    return l;
                });
                if (field === 'textLayers') {
                    newConfig.textLayers = value;
                }
            } else {
                if (["width", "height"].includes(field)) {
                    newConfig[field] = value === '' ? undefined : Number(value);
                } else {
                    newConfig[field] = value;
                }
            }
    
            if (field === "background") {
                delete newConfig.backgroundImage;
            }
    
            newConfigs[index] = newConfig;
            return newConfigs;
        });
    };

    const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    const newConfigs = [...configs];
                    newConfigs[index] = {
                        ...newConfigs[index],
                        backgroundImage: result,
                        width: img.width,
                        height: img.height,
                    };
                    setConfigs(newConfigs);
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrl = (index: number, url: string) => {
        if (!url) {
            toast({
                variant: 'destructive',
                title: 'Invalid URL',
                description: 'Please enter a valid image URL.',
            });
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const newConfigs = [...configs];
            newConfigs[index] = {
                ...newConfigs[index],
                backgroundImage: url,
                width: img.width,
                height: img.height,
            };
            setConfigs(newConfigs);
        };
        img.onerror = () => {
            toast({
                variant: 'destructive',
                title: `Could not load image for item ${index+1}`,
                description: 'Please check the URL and CORS policy.',
            });
        };
        img.src = url;
    };
    
    const handleAiGenerateImage = async (index: number, prompt: string) => {
        if (!prompt.trim()) {
            toast({
                variant: "destructive",
                title: "Prompt is empty",
                description: "Please enter a prompt to generate an image.",
            });
            return;
        }

        setGeneratingAiImageIndex(index);
        try {
            const result = await generateBackgroundImage({ prompt });
            const dataUri = result.backgroundImageDataUri;

            const img = new Image();
            img.onload = () => {
                 const newConfigs = [...configs];
                 newConfigs[index] = {
                     ...newConfigs[index],
                     backgroundImage: dataUri,
                     width: img.width,
                     height: img.height,
                 };
                 setConfigs(newConfigs);
                 toast({ title: `AI background generated for image ${index + 1}` });
            };
            img.onerror = () => {
                toast({
                    variant: "destructive",
                    title: "Error loading generated image",
                    description: "The AI-generated image could not be loaded.",
                });
            }
            img.src = dataUri;

        } catch (error: any) {
            console.error("AI Generation Error:", error);
            toast({
                variant: "destructive",
                title: "AI Generation Failed",
                description: error.message || "An unknown error occurred.",
            });
        } finally {
            setGeneratingAiImageIndex(null);
        }
    };


    const handleAddBlankImage = () => {
        setConfigs([
            ...configs,
            {
                "textLayers": [{
                    id: Date.now(),
                    "text": "New Image",
                    "textColor": "#000000",
                    "fontSize": 64,
                    "fontFamily": "'Inter', sans-serif",
                    "textAlign": "center",
                    "layout": { "position": "center" }
                }],
                "background": "#FFFFFF",
                "width": 1280,
                "height": 720,
            }
        ]);
    };

    const handleRemoveImage = (index: number) => {
        const newConfigs = configs.filter((_, i) => i !== index);
        setConfigs(newConfigs);
    };

    const handleRandomBackground = (index: number) => {
        const randomHue = () => Math.floor(Math.random() * 360);
        const randomPastel = () => `hsl(${randomHue()}, 70%, 85%)`;
        
        let newBackground;
        if (Math.random() > 0.4) { // 60% chance for gradient
            const directions = ['to right', 'to bottom right', 'to bottom', 'to bottom left', 'to left', 'to top left', 'to top', 'to top right'];
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            newBackground = `linear-gradient(${randomDirection}, ${randomPastel()}, ${randomPastel()})`
        } else { // 40% chance for solid color
            newBackground = randomPastel();
        }
        
        handleConfigChange(index, 'background', newBackground);
    }

    const handleApplyToAll = (field: string, value: any) => {
        let newConfigs;

        if (field === 'textColor' || field === 'fontFamily') {
             newConfigs = configs.map(config => {
                const newConfig = { ...config };
                if (newConfig.textLayers && newConfig.textLayers.length > 0) {
                    newConfig.textLayers = newConfig.textLayers.map((layer:any, index: number) => {
                        if (index === 0) {
                            return { ...layer, [field]: value };
                        }
                        return layer;
                    });
                }
                return newConfig;
            });
        } else {
            newConfigs = configs.map(config => {
                let newConfig = { ...config, [field]: value };
                if (field === 'background' && value) {
                    delete newConfig.backgroundImage;
                }
                if (field === 'width' || field === 'height') {
                    newConfig[field] = Number(value);
                }
                return newConfig;
            });
        }
        
        setConfigs(newConfigs);
        toast({
            title: "Applied to All",
            description: `Set ${field} for all ${configs.length} images.`,
        });
    }

    const openApplyStylesDialog = (index: number) => {
        setStyleSourceIndex(index);
        setApplyStylesDialogOpen(true);
    };

    const applyStylesToAll = (includeBackground: boolean) => {
        if (styleSourceIndex === null) return;

        const sourceConfig = configs[styleSourceIndex];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { textLayers, ...sourceStyles } = sourceConfig;

        if (!includeBackground) {
            delete sourceStyles.background;
            delete sourceStyles.backgroundImage;
        }
        
        const sourceLayerStyles = textLayers[0] ? (({ text, ...rest }: {text: string, [key: string]: any}) => rest)(textLayers[0]) : {};

        const newConfigs = configs.map((config, index) => {
            if (index === styleSourceIndex) {
                return config;
            }
            return {
                ...config,
                ...sourceStyles,
                textLayers: config.textLayers.map((layer:any) => ({...layer, ...sourceLayerStyles}))
            };
        });

        setConfigs(newConfigs);
        toast({
            title: 'Styles Applied',
            description: `Applied styles from image ${styleSourceIndex + 1} to all other images.`,
        });
    };

    const handleTemplateSelect = (templateJson: string) => {
        setSelectedTemplates(prev => {
            if (prev.includes(templateJson)) {
                return prev.filter(t => t !== templateJson);
            } else {
                return [...prev, templateJson];
            }
        });
    };

    const handleAddFromTemplates = () => {
        const newConfigs = selectedTemplates.map(templateJson => {
            const template = JSON.parse(templateJson)[0];
            template.textLayers = template.textLayers.map((l: any) => ({ ...l, id: Date.now() + Math.random() }));
            return template;
        });

        setConfigs(prev => [...prev, ...newConfigs]);
        toast({
            title: `${newConfigs.length} template(s) added`,
            description: 'The new images have been added to your batch.',
        });
        setTemplateDialogOpen(false);
        setSelectedTemplates([]);
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName.trim()) {
            toast({ variant: 'destructive', title: 'Template name is required.' });
            return;
        }
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                toast({ variant: 'destructive', title: 'Invalid Template', description: 'JSON must be an array with at least one image config.' });
                return;
            }
            
            // We only save the first image from the batch as a template
            const templateJson = JSON.stringify([parsed[0]], null, 2);
            
            const newTemplate: CustomTemplate = {
                name: newTemplateName,
                json: templateJson,
            };
            saveCustomTemplate(newTemplate);
            setCustomTemplates(getCustomTemplates());
            setSaveTemplateDialogOpen(false);
            setNewTemplateName("");
            toast({ title: `Template "${newTemplateName}" saved!` });

        } catch (e) {
            toast({ variant: 'destructive', title: 'Invalid JSON', description: 'Cannot save an invalid JSON configuration as a template.' });
        }
    };


    const BatchPreview = ({ config, index }: { config: any; index: number }) => {
        const canvasRef = React.useRef<HTMLCanvasElement>(null);
    
        useEffect(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                drawOnCanvas(canvas, {
                    ...config,
                    dpr: 1, // Lower DPR for previews
                }).catch(err => {
                    toast({
                        variant: "destructive",
                        title: `Preview Error (Image ${index+1})`,
                        description: err.message
                    });
                });
            }
        }, [config, index]);
    
        return (
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">Preview {index + 1}</p>
                 <canvas 
                    ref={canvasRef} 
                    className="w-full shadow-lg rounded-md bg-card-foreground/5"
                    style={{
                        aspectRatio: `${config.width || 1280} / ${config.height || 720}`
                    }}
                />
            </div>
        );
    };

    const renderForm = () => (
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Apply to All</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Background</Label>
                        <div className="flex gap-2">
                            <Input value={globalBackground} onChange={e => setGlobalBackground(e.target.value)} placeholder="e.g., #FFFFFF or linear-gradient(...)"/>
                            <Button onClick={() => handleApplyToAll('background', globalBackground)}>Apply</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Font Family (for first layer)</Label>
                        <div className="flex gap-2">
                            <Select value={globalFontFamily} onValueChange={setGlobalFontFamily}>
                                <SelectTrigger><SelectValue placeholder="Select a font" /></SelectTrigger>
                                <SelectContent>
                                    {fontFamilies.map(f => <SelectItem key={f.name} value={f.family} style={{fontFamily: f.family}}>{f.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={() => handleApplyToAll('fontFamily', globalFontFamily)}>Apply</Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Text Color (for first layer)</Label>
                        <div className="flex gap-2">
                            <Input type="color" value={globalTextColor} onChange={e => setGlobalTextColor(e.target.value)} className="p-1 h-10"/>
                            <Button onClick={() => handleApplyToAll('textColor', globalTextColor)}>Apply</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Width</Label>
                            <div className="flex gap-2">
                                <Input type="number" value={globalWidth} onChange={e => setGlobalWidth(Number(e.target.value))}/>
                                <Button onClick={() => handleApplyToAll('width', globalWidth)}>Apply</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Height</Label>
                            <div className="flex gap-2">
                                <Input type="number" value={globalHeight} onChange={e => setGlobalHeight(Number(e.target.value))}/>
                                <Button onClick={() => handleApplyToAll('height', globalHeight)}>Apply</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                {configs.map((config, index) => (
                    <BatchItem
                        key={index}
                        config={config}
                        index={index}
                        onConfigChange={(field, value, layerId) => handleConfigChange(index, field, value, layerId)}
                        onRemove={() => handleRemoveImage(index)}
                        onRandomBackground={() => handleRandomBackground(index)}
                        onImageUpload={(e) => handleImageUpload(index, e)}
                        onImageUrl={(url) => handleImageUrl(index, url)}
                        onAiGenerateImage={(prompt) => handleAiGenerateImage(index, prompt)}
                        generatingAiImageIndex={generatingAiImageIndex}
                        onApplyStylesToAll={() => openApplyStylesDialog(index)}
                    />
                ))}
            </Accordion>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTemplateDialogOpen(true)} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Image from Template
                </Button>
                 <Button variant="outline" onClick={handleAddBlankImage} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Blank Image
                </Button>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card-foreground/5">
                <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Generate with AI</Label>
                    <Textarea 
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., Create 5 images for a coffee shop promotion"
                        disabled={isGeneratingJson || isGenerating}
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Describe the set of images you want to create.</p>
                    <Button onClick={handleGenerateJson} disabled={isGeneratingJson || isGenerating} className="w-full">
                        {isGeneratingJson ? (
                            <>
                                <Bot className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate with AI
                            </>
                        )}
                    </Button>
                </div>
                 <div className="space-y-2 self-center">
                    <p className="text-sm font-medium text-muted-foreground text-center">Or start with a template:</p>
                    <Button variant="outline" onClick={() => setTemplateDialogOpen(true)} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add from Template Library
                    </Button>
                </div>
            </div>
            
            <Tabs defaultValue="form">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form"><FormInput className="mr-2"/> Form View</TabsTrigger>
                    <TabsTrigger value="json"><Code className="mr-2"/> JSON View</TabsTrigger>
                </TabsList>
                <TabsContent value="form" className="pt-4">
                    {renderForm()}
                </TabsContent>
                <TabsContent value="json" className="pt-4">
                    <div className="relative">
                        <Textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[ { "text": "My First Image" } ]'
                            rows={15}
                            className="font-mono text-sm bg-background"
                            disabled={isGenerating || isGeneratingJson}
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                             <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={!!jsonError}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Save as Template</DialogTitle>
                                        <DialogDescription>
                                            Save the current JSON for the first image as a reusable template.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                        <Label htmlFor="template-name">Template Name</Label>
                                        <Input 
                                            id="template-name" 
                                            value={newTemplateName} 
                                            onChange={(e) => setNewTemplateName(e.target.value)} 
                                            placeholder="e.g., YouTube Thumbnail"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSaveTemplate}>Save Template</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Code className="text-muted-foreground self-center" />
                        </div>
                    </div>
                     {jsonError && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Invalid JSON</AlertTitle>                            <AlertDescription>
                                <pre className="text-xs whitespace-pre-wrap">{jsonError}</pre>
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>
            </Tabs>


            <Button onClick={handleGenerateImages} disabled={isGenerating || !!jsonError || isGeneratingJson} size="lg" className="w-full">
                {isGenerating ? (
                    <>
                        <Bot className="mr-2 h-4 w-4 animate-spin" />
                        Generating {configs.length} Image(s)...
                    </>
                ) : `Generate ${configs.length} Image(s)`}
            </Button>
            
            {configs.length > 0 && !jsonError && (
                <div className="space-y-8 pt-4">
                     <h3 className="text-xl font-semibold border-b pb-2">Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {configs.map((config, index) => <BatchPreview key={index} config={config} index={index} />)}
                    </div>
                </div>
            )}

            <AlertDialog open={applyStylesDialogOpen} onOpenChange={setApplyStylesDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Apply Styles to All Images?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will apply all styles from Image {styleSourceIndex !== null ? styleSourceIndex + 1 : ''} to all other images. The text content will not be changed.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => applyStylesToAll(false)}>
                        Apply Styles Only
                    </AlertDialogAction>
                    <AlertDialogAction onClick={() => applyStylesToAll(true)}>
                        Apply Styles & Background
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Add Images from Templates</DialogTitle>
                        <DialogDescription>
                            Select one or more templates to add to your batch. Your custom templates are saved in your browser's local storage.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-1">
                        {[...customTemplates, ...imageTemplates].map((template) => {
                            const isSelected = selectedTemplates.includes(template.json);
                            return (
                                <div 
                                    key={template.name} 
                                    className={cn(
                                        "relative border-2 rounded-lg cursor-pointer transition-all",
                                        isSelected ? "border-primary" : "border-transparent hover:border-muted"
                                    )}
                                    onClick={() => handleTemplateSelect(template.json)}
                                >
                                    <TemplatePreview template={template} />
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                            <CheckSquare className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddFromTemplates} disabled={selectedTemplates.length === 0}>
                            Add {selectedTemplates.length > 0 ? selectedTemplates.length : ''} Selected Image(s)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
