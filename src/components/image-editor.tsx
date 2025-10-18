"use client";

import React, { useState, useRef, useCallback } from 'react';
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
import { AlignLeft, AlignCenter, AlignRight, Upload, Download, Sparkles, Bot, Shuffle, Link, PlusCircle, Trash2 } from 'lucide-react';
import { generateBackgroundImage } from '@/ai/flows/generate-background-image';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const defaultTextLayer = {
  id: Date.now(),
  text: 'Your Text Here',
  textColor: '#000000',
  fontSize: 64,
  fontFamily: fontFamilies[0].family,
  textAlign: 'center' as 'left' | 'center' | 'right',
  x: 640,
  y: 360,
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

export function ImageEditor() {
  const [textLayers, setTextLayers] = useState([defaultTextLayer]);
  const [background, setBackground] = useState(backgroundPatterns[0].value);
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('A beautiful sunset over mountains');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDim, setPreviewDim] = useState({ width: 1280, height: 720 });

  const handleLayerChange = (id: number, field: string, value: any) => {
    setTextLayers(layers => layers.map(layer => 
      layer.id === id ? { ...layer, [field]: value } : layer
    ));
  };
  
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
  
    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
        if (!text) return [];
        return text.split('\n');
    };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = previewDim;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const drawBackground = new Promise<void>((resolve) => {
      if (backgroundImageSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.onerror = (e) => {
            console.error("Error loading image for canvas:", e);
            toast({
                variant: 'destructive',
                title: 'Background Image Error',
                description: 'Could not load the background image. It might be due to CORS policy. Using a fallback background.',
            });
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            resolve();
        };
        img.src = backgroundImageSrc;
      } else {
        ctx.fillStyle = background.includes('gradient') ? '#F0F0F0' : background;
        if(background.includes('gradient')) {
            const colors = background.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+\%\s*,\s*[\d.]+\%\s*\)/g);
            if (colors && colors.length >= 2) {
                const directionMatch = background.match(/to (right|left|bottom|top)/);
                const direction = directionMatch ? directionMatch[1] : 'right';
                let gradient;

                if (direction === 'right') {
                    gradient = ctx.createLinearGradient(0, 0, width, 0);
                } else if (direction === 'left') {
                    gradient = ctx.createLinearGradient(width, 0, 0, 0);
                } else if (direction === 'bottom') {
                    gradient = ctx.createLinearGradient(0, 0, 0, height);
                } else { // top
                    gradient = ctx.createLinearGradient(0, height, 0, 0);
                }
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1]);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
        }
        ctx.fillRect(0, 0, width, height);
        resolve();
      }
    });

    drawBackground.then(() => {
        textLayers.forEach((layer) => {
            const {
                text,
                textColor,
                fontSize,
                fontFamily,
                textAlign,
                x,
                y,
                letterSpacing,
                addTextShadow,
                textShadowColor,
                textShadowBlur,
                textShadowOffsetX,
                textShadowOffsetY,
                textStrokeWidth,
                textStrokeColor,
                addTextBackground,
                textBackgroundColor
            } = layer;
            
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = textAlign as CanvasTextAlign;
            ctx.textBaseline = 'middle';
            ctx.letterSpacing = `${letterSpacing}px`;

            if (addTextShadow) {
                ctx.shadowColor = textShadowColor;
                ctx.shadowBlur = textShadowBlur;
                ctx.shadowOffsetX = textShadowOffsetX;
                ctx.shadowOffsetY = textShadowOffsetY;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            const lines = wrapText(ctx, text, previewDim.width - 80);
            const lineHeight = fontSize * 1.2;
            const totalTextHeight = lines.length * lineHeight;
            let startY = y - totalTextHeight / 2;


            lines.forEach((line: string, index: number) => {
                const currentY = startY + index * lineHeight + lineHeight / 2;
                
                if (addTextBackground) {
                    const textMetrics = ctx.measureText(line);
                    let actualLeft = textMetrics.actualBoundingBoxLeft;
                    let actualRight = textMetrics.actualBoundingBoxRight;
                    const textWidth = actualLeft + actualRight;

                    const bgPadding = fontSize / 4;
                    const currentShadow = ctx.shadowColor; //
                    ctx.shadowColor = 'transparent';
                    ctx.fillStyle = textBackgroundColor;
                    
                    let rectX;
                    if (textAlign === 'center') {
                        rectX = x - textWidth / 2 - bgPadding;
                    } else if (textAlign === 'left') {
                        rectX = x - bgPadding;
                    } else { // right
                        rectX = x - textWidth - bgPadding;
                    }
                    
                    const rectY = currentY - (lineHeight/2) - bgPadding/2;
                    ctx.fillRect(rectX, rectY, textWidth + bgPadding * 2, lineHeight + bgPadding);
                    ctx.shadowColor = currentShadow;
                    ctx.fillStyle = textColor;
                }
                
                if (textStrokeWidth > 0) {
                    ctx.strokeStyle = textStrokeColor;
                    ctx.lineWidth = textStrokeWidth;
                    ctx.strokeText(line, x, currentY);
                }

                ctx.fillText(line, x, currentY);
            });
        });

        const link = document.createElement('a');
        link.download = 'image-overlay.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
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
  }
  
  const backgroundStyle: React.CSSProperties = backgroundImageSrc ? {
    backgroundImage: `url(${backgroundImageSrc})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: 'var(--card)'
  } : {
    background: background,
  };

  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Customize Your Image</CardTitle>
          <CardDescription>Adjust the settings to create your perfect image overlay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <Accordion type="multiple" defaultValue={[`layer-${textLayers[0]?.id}`]} className="w-full">
            <AccordionItem value="text-layers">
                <AccordionTrigger>Text Layers</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <Accordion type="multiple" defaultValue={[`layer-${textLayers[0]?.id}`]} className="w-full">
                     {textLayers.map((layer, index) => (
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
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`layer-x-${layer.id}`}>Position X</Label>
                                        <Input id={`layer-x-${layer.id}`} type="number" value={layer.x} onChange={(e) => handleLayerChange(layer.id, 'x', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`layer-y-${layer.id}`}>Position Y</Label>
                                        <Input id={`layer-y-${layer.id}`} type="number" value={layer.y} onChange={(e) => handleLayerChange(layer.id, 'y', parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Font Size: {layer.fontSize}px</Label>
                                    <Slider value={[layer.fontSize]} onValueChange={([val]) => handleLayerChange(layer.id, 'fontSize', val)} min={16} max={256} step={1} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Letter Spacing: {layer.letterSpacing}px</Label>
                                    <Slider value={[layer.letterSpacing]} onValueChange={([val]) => handleLayerChange(layer.id, 'letterSpacing', val)} min={-10} max={50} step={1} />
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
                                        <AccordionContent className="space-y-4">
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
                                                <Switch checked={layer.textStrokeWidth > 0} onCheckedChange={(checked) => handleLayerChange(layer.id, 'textStrokeWidth', checked ? 2 : 0)} />
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
                                                        <Label>Shadow Blur: {layer.textShadowBlur}px</Label>
                                                        <Slider value={[layer.textShadowBlur]} onValueChange={([val]) => handleLayerChange(layer.id, 'textShadowBlur', val)} min={0} max={50} step={1} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Offset X: {layer.textShadowOffsetX}px</Label>
                                                            <Slider value={[layer.textShadowOffsetX]} onValueChange={([val]) => handleLayerChange(layer.id, 'textShadowOffsetX', val)} min={-20} max={20} step={1} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Offset Y: {layer.textShadowOffsetY}px</Label>
                                                            <Slider value={[layer.textShadowOffsetY]} onValueChange={([val]) => handleLayerChange(layer.id, 'textShadowOffsetY', val)} min={-20} max={20} step={1} />
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
                     ))}
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
            <div
              className="w-full flex flex-col items-center justify-center shadow-lg relative"
              style={{ ...backgroundStyle, aspectRatio: `${previewDim.width} / ${previewDim.height}` }}
            >
              {textLayers.map(layer => {
                  const textStyle: React.CSSProperties = {
                    position: 'absolute',
                    top: `${(layer.y / previewDim.height) * 100}%`,
                    left: `${(layer.x / previewDim.width) * 100}%`,
                    transform: `translate(-50%, -50%)`,
                    color: layer.textColor,
                    fontSize: `${layer.fontSize / 32}rem`, // Scale font size for preview
                    fontFamily: layer.fontFamily,
                    textAlign: layer.textAlign as CanvasTextAlign,
                    lineHeight: 1.2,
                    whiteSpace: 'pre-wrap',
                    padding: '1rem',
                    wordBreak: 'break-word',
                    letterSpacing: `${layer.letterSpacing / 32}rem`,
                    WebkitTextStroke: layer.textStrokeWidth > 0 ? `${layer.textStrokeWidth / 16}rem ${layer.textStrokeColor}` : 'unset',
                    textShadow: layer.addTextShadow ? `${layer.textShadowOffsetX/16}rem ${layer.textShadowOffsetY/16}rem ${layer.textShadowBlur/16}rem ${layer.textShadowColor}` : 'none',
                    backgroundColor: layer.addTextBackground ? layer.textBackgroundColor : 'transparent',
                    borderRadius: layer.addTextBackground ? '0.25rem' : 'none',
                  };
                  return (
                     <div key={layer.id} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                        <p style={textStyle}>
                            {layer.text}
                        </p>
                     </div>
                  )
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardFooter>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
