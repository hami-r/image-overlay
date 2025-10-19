
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fontFamilies } from '@/lib/fonts';
import { backgroundPatterns } from '@/lib/backgrounds';
import { AlignLeft, AlignCenter, AlignRight, Upload, Download, Sparkles, Bot, Shuffle, Link, PlusCircle, Trash2, LayoutTemplate } from 'lucide-react';
import { generateBackgroundImage } from '@/ai/flows/generate-background-image';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { imageTemplates } from '@/lib/templates';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


const defaultTextLayer = {
  id: Date.now(),
  text: 'Your Text Here',
  textColor: '#000000',
  fontSize: 64,
  fontFamily: fontFamilies[0].family,
  textAlign: 'center' as 'left' | 'center' | 'right',
  layout: { position: 'center' },
  x: undefined,
  y: undefined,
  letterSpacing: 0,
  addTextShadow: false,
  textShadowColor: 'rgba(0,0,0,0.5)',
  textShadowBlur: 10,
  textShadowOffsetX: 5,
  textShadowOffsetY: 5,
  textStrokeWidth: 0,
  textStrokeColor: '#FFFFFF',
  addTextBackground: false,
  textBackgroundColor: 'rgba(0, 0, 0, 0.5)',
};

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
            const getWrappedLines = (layer: any) => {
                const { text = "", fontSize = 64, fontFamily = "'Inter', sans-serif" } = layer;
                ctx.font = `${fontSize}px ${fontFamily}`;
                const maxWidth = width - (width * 0.1); // 5% margin on each side
                
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
                return wrappedLines;
            };

            const drawTextLayer = (layer: any, x: number, y: number) => {
                const {
                    textColor = '#000000', fontSize = 64, fontFamily = "'Inter', sans-serif",
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

                const wrappedLines = getWrappedLines(layer);
                const lineHeight = fontSize * 1.2;
                const totalLayerHeight = wrappedLines.length * lineHeight;
                
                let startY = y - (totalLayerHeight / 2);

                wrappedLines.forEach((line: string) => {
                    const currentLineY = startY + (lineHeight / 2);
                    
                    if (addTextBackground) {
                        const textMetrics = ctx.measureText(line);
                        const bgPadding = fontSize / 4;
                        let textWidth = textMetrics.width;

                        const currentShadow = { c: ctx.shadowColor, b: ctx.shadowBlur, x: ctx.shadowOffsetX, y: ctx.shadowOffsetY };
                        ctx.shadowColor = 'transparent';
                        ctx.fillStyle = textBackgroundColor;

                        let rectX;
                        if (ctx.textAlign === 'left') rectX = x - bgPadding;
                        else if (ctx.textAlign === 'right') rectX = x - textWidth - bgPadding;
                        else rectX = x - textWidth / 2 - bgPadding;
                        
                        const rectY = currentLineY - (lineHeight/2) - bgPadding/2;
                        ctx.fillRect(rectX, rectY, textWidth + bgPadding * 2, lineHeight + bgPadding);
                        
                        ctx.shadowColor = currentShadow.c; ctx.shadowBlur = currentShadow.b; ctx.shadowOffsetX = currentShadow.x; ctx.shadowOffsetY = currentShadow.y;
                        ctx.fillStyle = textColor;
                    }

                    if (textStrokeWidth > 0) {
                        ctx.strokeStyle = textStrokeColor;
                        ctx.lineWidth = textStrokeWidth;
                        ctx.strokeText(line, x, currentLineY);
                    }
                    ctx.fillText(line, x, currentLineY);
                    startY += lineHeight;
                });
            };

            const manualLayers = textLayers.filter((l: any) => l.x !== undefined && l.y !== undefined && !l.layout);
            const autoLayoutLayers = textLayers.filter((l: any) => l.layout?.position && (l.x === undefined || l.y === undefined));
            const noPositionInfoLayers = textLayers.filter((l: any) => !l.layout && (l.x === undefined || l.y === undefined));

            // Draw manual layers first
            manualLayers.forEach((layer: any) => drawTextLayer(layer, layer.x, layer.y));
            
            // Process auto-layout layers
            const verticalGroups: { [key: string]: any[] } = { top: [], center: [], bottom: [] };
            autoLayoutLayers.forEach((layer: any) => {
                const vPos = layer.layout.position.split('-')[0];
                if (verticalGroups[vPos]) {
                    verticalGroups[vPos].push(layer);
                }
            });
            
            Object.keys(verticalGroups).forEach(vGroupKey => {
                const group = verticalGroups[vGroupKey];
                if (group.length === 0) return;

                const totalGroupHeight = group.reduce((acc, layer) => {
                    const lines = getWrappedLines(layer);
                    return acc + (lines.length * (layer.fontSize || 64) * 1.2);
                }, 0);

                let regionY;
                const margin = height * 0.05;
                if (vGroupKey === 'top') regionY = margin;
                else if (vGroupKey === 'bottom') regionY = height - margin - totalGroupHeight;
                else regionY = (height - totalGroupHeight) / 2;

                let currentY = regionY;

                group.forEach(layer => {
                    const lines = getWrappedLines(layer);
                    const layerHeight = lines.length * (layer.fontSize || 64) * 1.2;
                    const layerCenterY = currentY + layerHeight / 2;
                    
                    const hPos = layer.layout.position.split('-')[1] || 'center';
                    let x;
                    const hMargin = width * 0.05;

                    if (hPos === 'left') x = hMargin;
                    else if (hPos === 'right') x = width - hMargin;
                    else x = width / 2;
                    
                    ctx.textAlign = hPos as CanvasTextAlign;

                    drawTextLayer(layer, x, layerCenterY);

                    currentY += layerHeight;
                });
            });

            // Process layers with no position info (center-stack them)
            if (noPositionInfoLayers.length > 0) {
                const totalHeight = noPositionInfoLayers.reduce((acc, layer) => {
                    const lines = getWrappedLines(layer);
                    return acc + (lines.length * (layer.fontSize || 64) * 1.2);
                }, 0);
                
                let yOffset = (height - totalHeight) / 2;

                noPositionInfoLayers.forEach(layer => {
                    const lines = getWrappedLines(layer);
                    const layerHeight = lines.length * (layer.fontSize || 64) * 1.2;
                    const layerCenterY = yOffset + layerHeight / 2;

                    drawTextLayer(layer, width / 2, layerCenterY);
                    
                    yOffset += layerHeight;
                });
            }

            resolve();
        }).catch(reject);
    });
};

export function ImageEditor() {
  const [textLayers, setTextLayers] = useState([{...defaultTextLayer, id: Date.now()}]);
  const [background, setBackground] = useState(backgroundPatterns[0].value);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('A beautiful sunset over mountains');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDim, setPreviewDim] = useState({ width: 1280, height: 720 });
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);


  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (canvas) {
      drawOnCanvas(canvas, {
        textLayers,
        background,
        backgroundImage: backgroundImageSrc,
        width: previewDim.width,
        height: previewDim.height,
        dpr: 1, // Use lower DPR for preview for performance
      }).catch(err => {
        toast({
            variant: "destructive",
            title: "Preview Error",
            description: err.message
        });
      });
    }
  }, [textLayers, background, backgroundImageSrc, previewDim, toast]);

  const handleLayerChange = (id: number, field: string, value: any) => {
    setTextLayers(layers => layers.map(layer => {
      if (layer.id === id) {
        const newLayer = { ...layer, [field]: value };
        if (["fontSize", "letterSpacing", "textStrokeWidth", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"].includes(field)) {
          newLayer[field] = value === '' ? undefined : Number(value);
        } else if (["x", "y"].includes(field)) {
            newLayer[field] = value === '' ? undefined : Number(value);
        }
        return newLayer;
      }
      return layer;
    }));
  };

  const handlePositioningModeChange = (id: number, mode: 'auto' | 'manual') => {
      setTextLayers(layers => layers.map(layer => {
          if (layer.id === id) {
              const newLayer = {...layer};
              if (mode === 'auto') {
                  newLayer.layout = { position: newLayer.layout?.position || 'center' };
                  delete newLayer.x;
                  delete newLayer.y;
              } else { // manual
                  delete newLayer.layout;
                  newLayer.x = newLayer.x ?? previewDim.width / 2;
                  newLayer.y = newLayer.y ?? previewDim.height / 2;
              }
              return newLayer;
          }
          return layer;
      }));
  }

  const handleLayoutPositionChange = (id: number, position: string) => {
    setTextLayers(layers => layers.map(layer => {
        if (layer.id === id) {
            return {...layer, layout: { position }};
        }
        return layer;
    }));
  }
  
  const addLayer = () => {
    setTextLayers(layers => [...layers, { ...defaultTextLayer, id: Date.now(), text: "New Layer" }]);
  };

  const removeLayer = (id: number) => {
    if (textLayers.length > 1) {
      setTextLayers(layers => layers.filter(layer => layer.id !== id));
    } else {
        toast({
            variant: "destructive",
            title: "Cannot remove last layer",
            description: "You must have at least one text layer.",
        });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setPreviewDim({ width: img.width, height: img.height });
          setBackgroundImageSrc(result);
          setBackground(''); // Deselect any color/pattern
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = () => {
    if (!imageUrl) {
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
        setPreviewDim({ width: img.width, height: img.height });
        setBackgroundImageSrc(imageUrl);
        setBackground('');
    };
    img.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Could not load image',
            description: 'Please check the URL and ensure the image allows cross-origin access.',
        });
    };
    img.src = imageUrl;
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
        toast({
            variant: "destructive",
            title: "Prompt is empty",
            description: "Please enter a prompt to generate an image.",
        });
        return;
    }

    setIsGenerating(true);
    try {
        const result = await generateBackgroundImage({ prompt: aiPrompt });
        const dataUri = result.backgroundImageDataUri;

        const img = new Image();
        img.onload = () => {
            setPreviewDim({ width: img.width, height: img.height });
            setBackgroundImageSrc(dataUri);
            setBackground(''); // Deselect any color/pattern
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
        setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const canvas = document.createElement('canvas');
    
    try {
        await drawOnCanvas(canvas, {
            textLayers,
            background,
            backgroundImage: backgroundImageSrc,
            width: previewDim.width,
            height: previewDim.height,
            dpr: window.devicePixelRatio || 2,
        });

        const link = document.createElement('a');
        link.download = 'image-overlay.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Failed to generate image",
            description: e.message
        })
    }
  };

  const handleRandomBackground = () => {
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
    
    setBackground(newBackground);
    setBackgroundImageSrc(null);
    setPreviewDim({width: 1280, height: 720});
  };

  const handleLoadTemplate = (templateValue: string) => {
    if (!templateValue) return;

    try {
      const parsedTemplates = JSON.parse(templateValue);
      const imageConfig = parsedTemplates[0]; // Use the first image config from the template array

      if (imageConfig) {
        setTextLayers(imageConfig.textLayers.map((l: any) => ({ ...l, id: Date.now() + Math.random() })));
        setPreviewDim({ width: imageConfig.width || 1280, height: imageConfig.height || 720 });
        
        if (imageConfig.backgroundImage) {
          setBackgroundImageSrc(imageConfig.backgroundImage);
          setBackground('');
        } else {
          setBackgroundImageSrc(null);
          setBackground(imageConfig.background || '#FFFFFF');
        }

        toast({
          title: "Template Loaded",
          description: "The editor has been updated with the selected template."
        });
        setTemplatePopoverOpen(false);
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to load template",
        description: "The selected template contained invalid data."
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Customize Your Image</CardTitle>
          <CardDescription>Adjust the settings to create your perfect image overlay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
              <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                      <LayoutTemplate className="mr-2 h-4 w-4" />
                      Load a Template...
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                  <div className="flex flex-col">
                      {imageTemplates.map(template => (
                          <Button 
                              key={template.name} 
                              variant="ghost" 
                              className="justify-start"
                              onClick={() => handleLoadTemplate(template.json)}
                          >
                              {template.name}
                          </Button>
                      ))}
                  </div>
              </PopoverContent>
          </Popover>

          <Accordion type="multiple" defaultValue={[`layer-${textLayers[0]?.id}`]} className="w-full">
            <AccordionItem value="text-layers">
                <AccordionTrigger>Text Layers</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <Accordion type="multiple" defaultValue={[`layer-${textLayers[0]?.id}`]} className="w-full">
                     {textLayers.map((layer, index) => {
                        const positioningMode = layer.layout?.position ? 'auto' : 'manual';
                        return (
                        <AccordionItem key={layer.id} value={`layer-${layer.id}`}>
                            <AccordionTrigger>
                                <span className="truncate">Layer {index+1}: {layer.text}</span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`text-input-${layer.id}`}>Overlay Text</Label>
                                    <Textarea id={`text-input-${layer.id}`} value={layer.text} onChange={(e) => handleLayerChange(layer.id, 'text', e.target.value)} placeholder="Your text here" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                    <Label htmlFor={`text-color-${layer.id}`}>Text Color</Label>
                                    <Input id={`text-color-${layer.id}`} type="color" value={layer.textColor} onChange={(e) => handleLayerChange(layer.id, 'textColor', e.target.value)} className="p-1 h-10"/>
                                    </div>
                                    <div className="space-y-2">
                                    <Label htmlFor={`font-family-${layer.id}`}>Font Family</Label>
                                    <Select value={layer.fontFamily} onValueChange={(v) => handleLayerChange(layer.id, 'fontFamily', v)}>
                                        <SelectTrigger id={`font-family-${layer.id}`}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                        {fontFamilies.map(font => <SelectItem key={font.name} value={font.family} style={{ fontFamily: font.family }}>{font.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    </div>
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
                                        <Label htmlFor={`layer-position-${layer.id}`}>Position</Label>
                                        <Select value={layer.layout?.position} onValueChange={(v) => handleLayoutPositionChange(layer.id, v)}>
                                            <SelectTrigger id={`layer-position-${layer.id}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {positionOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`layer-x-${layer.id}`}>Position X</Label>
                                            <Input id={`layer-x-${layer.id}`} type="number" placeholder={`${previewDim.width/2}`} value={layer.x ?? ''} onChange={(e) => handleLayerChange(layer.id, 'x', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`layer-y-${layer.id}`}>Position Y</Label>
                                            <Input id={`layer-y-${layer.id}`} type="number" placeholder={`${previewDim.height/2}`} value={layer.y ?? ''} onChange={(e) => handleLayerChange(layer.id, 'y', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Font Size: {layer.fontSize}px</Label>
                                    <Slider value={[layer.fontSize]} onValueChange={([val]) => handleLayerChange(layer.id, 'fontSize', val)} min={16} max={256} step={1} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Letter Spacing: {layer.letterSpacing || 0}px</Label>
                                    <Slider value={[layer.letterSpacing || 0]} onValueChange={([val]) => handleLayerChange(layer.id, 'letterSpacing', val)} min={-10} max={50} step={1} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Text Alignment</Label>
                                    <ToggleGroup type="single" value={layer.textAlign} onValueChange={(val: 'left' | 'center' | 'right') => val && handleLayerChange(layer.id, 'textAlign', val)} className="w-full">
                                    <ToggleGroupItem value="left" className="w-full"><AlignLeft /></ToggleGroupItem>
                                    <ToggleGroupItem value="center" className="w-full"><AlignCenter /></ToggleGroupItem>
                                    <ToggleGroupItem value="right" className="w-full"><AlignRight /></ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="text-style">
                                        <AccordionTrigger>Styling</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label>Text Background</Label>
                                                    <p className="text-xs text-muted-foreground">Improve readability.</p>
                                                </div>
                                                <Switch checked={layer.addTextBackground} onCheckedChange={(v) => handleLayerChange(layer.id, 'addTextBackground', v)} />
                                            </div>
                                            {layer.addTextBackground && (
                                                <div className="space-y-2 border p-3 rounded-lg">
                                                <Label htmlFor={`text-bg-color-${layer.id}`}>Text BG Color</Label>
                                                <Input id={`text-bg-color-${layer.id}`} type="color" value={layer.textBackgroundColor} onChange={(e) => handleLayerChange(layer.id, 'textBackgroundColor', e.target.value)} className="p-1 h-10"/>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label>Text Stroke</Label>
                                                    <p className="text-xs text-muted-foreground">Add an outline to text.</p>
                                                </div>
                                                <Switch checked={!!layer.textStrokeWidth && layer.textStrokeWidth > 0} onCheckedChange={(checked) => handleLayerChange(layer.id, 'textStrokeWidth', checked ? 2 : 0)} />
                                            </div>
                                            {layer.textStrokeWidth > 0 && (
                                                <div className="space-y-4 border p-3 rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label>Stroke Width: {layer.textStrokeWidth}px</Label>
                                                        <Slider value={[layer.textStrokeWidth]} onValueChange={([val]) => handleLayerChange(layer.id, 'textStrokeWidth', val)} min={0} max={20} step={1} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`text-stroke-color-${layer.id}`}>Stroke Color</Label>
                                                        <Input id={`text-stroke-color-${layer.id}`} type="color" value={layer.textStrokeColor} onChange={(e) => handleLayerChange(layer.id, 'textStrokeColor', e.target.value)} className="p-1 h-10"/>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <Label>Text Shadow</Label>
                                                    <p className="text-xs text-muted-foreground">Add a drop shadow.</p>
                                                </div>
                                                <Switch checked={layer.addTextShadow} onCheckedChange={(v) => handleLayerChange(layer.id, 'addTextShadow', v)} />
                                            </div>
                                            {layer.addTextShadow && (
                                                <div className="space-y-4 border p-3 rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`text-shadow-color-${layer.id}`}>Shadow Color</Label>
                                                        <Input id={`text-shadow-color-${layer.id}`} type="color" value={layer.textShadowColor} onChange={(e) => handleLayerChange(layer.id, 'textShadowColor', e.target.value)} className="p-1 h-10"/>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Shadow Blur: {layer.textShadowBlur || 10}px</Label>
                                                        <Slider value={[layer.textShadowBlur || 10]} onValueChange={([val]) => handleLayerChange(layer.id, 'textShadowBlur', val)} min={0} max={50} step={1} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Offset X: {layer.textShadowOffsetX || 5}px</Label>
                                                            <Slider value={[layer.textShadowOffsetX || 5]} onValueChange={([val]) => handleLayerChange(layer.id, 'textShadowOffsetX', val)} min={-20} max={20} step={1} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Offset Y: {layer.textShadowOffsetY || 5}px</Label>
                                                            <Slider value={[layer.textShadowOffsetY || 5]} onValueChange={([val]) => handleLayerChange(layer.id, 'textShadowOffsetY', val)} min={-20} max={20} step={1} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <Button variant="outline" size="sm" onClick={() => removeLayer(layer.id)} className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" /> Remove Layer
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                     )})}
                    </Accordion>
                     <Button variant="outline" onClick={addLayer} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Text Layer
                    </Button>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="background">
                <AccordionTrigger>Background</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-between items-center">
                            <div/>
                            <Button variant="ghost" size="sm" onClick={handleRandomBackground}>
                                <Shuffle className="w-4 h-4 mr-2"/>
                                Random
                            </Button>
                        </div>
                        <Tabs defaultValue="pattern">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="pattern">Color</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                <TabsTrigger value="url">URL</TabsTrigger>
                                <TabsTrigger value="ai">AI</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pattern" className="pt-4">
                                <div className="grid grid-cols-5 gap-2">
                                    {backgroundPatterns.map(p => (
                                        <button key={p.name} title={p.name} onClick={() => { setBackground(p.value); setBackgroundImageSrc(null); setPreviewDim({width:1280, height: 720}) }} className={ `w-full h-10 rounded-md border-2 ${ (background === p.value && !backgroundImageSrc) ? 'border-ring' : 'border-transparent'}` } style={{ background: p.value }} />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="upload" className="pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    </div>
                                    <Input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*"/>
                                    </Label>
                                </div>
                            </TabsContent>
                            <TabsContent value="url" className="pt-4 space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <div className="flex gap-2">
                                    <Input id="image-url" type="url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                                    <Button onClick={handleImageUrl}><Link className="w-4 h-4" /></Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Note: Images from other websites may be subject to CORS restrictions.
                                </p>
                            </TabsContent>
                            <TabsContent value="ai" className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ai-prompt">AI Prompt</Label>
                                    <Input 
                                        id="ai-prompt" 
                                        value={aiPrompt} 
                                        onChange={(e) => setAiPrompt(e.target.value)} 
                                        placeholder="e.g., A futuristic cityscape at night"
                                        disabled={isGenerating}
                                    />
                                    <p className="text-xs text-muted-foreground">Describe the background you want to generate.</p>
                                </div>
                                <Button onClick={handleAiGenerate} disabled={isGenerating} className="w-full">
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
                            </TabsContent>
                        </Tabs>
                    </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
      
      <div className="lg:col-span-8 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center bg-card-foreground/5 p-4">
            <canvas 
                ref={previewCanvasRef} 
                className="shadow-lg rounded-md max-w-full"
                style={{
                    aspectRatio: `${previewDim.width} / ${previewDim.height}`
                }}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}

    