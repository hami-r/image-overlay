"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Code, Bot, AlertTriangle, Sparkles, Trash2, PlusCircle, FormInput, Shuffle, Upload, Link, Copy } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const exampleJson = [
  {
    "textLayers": [
      {
        "text": "Welcome to the Future",
        "textColor": "#FFFFFF",
        "fontSize": 96,
        "fontFamily": "'Inter', sans-serif"
      },
      {
        "text": "A new era of design.",
        "textColor": "#DDDDDD",
        "fontSize": 32,
        "fontFamily": "'Inter', sans-serif"
      }
    ],
    "background": "linear-gradient(to right, #2b5876, #4e4376)",
    "width": 1280,
    "height": 720
  },
  {
    "textLayers": [
      {
        "text": "Product Launch",
        "textColor": "#000000",
        "fontSize": 80,
        "fontFamily": "'Playfair Display', serif",
        "addTextShadow": true
      },
      {
        "text": "Coming Soon",
        "textColor": "#333333",
        "fontSize": 40
      }
    ],
    "background": "#C1E1C1",
    "width": 1080,
    "height": 1080
  },
  {
    "textLayers": [
       {
        "text": "Batch\nCreation\nRocks!",
        "textColor": "#FFFFFF",
        "fontSize": 128,
        "fontFamily": "'Playfair Display', serif",
        "addTextShadow": true,
        "textShadowBlur": 5,
        "x": 540,
        "y": 480
      },
      {
        "text": "So easy!",
        "textColor": "#FFFFFF",
        "fontSize": 64,
        "fontFamily": "'Inter', sans-serif",
        "textStrokeWidth": 2,
        "textStrokeColor": "#000000",
        "x": 540,
        "y": 800
      }
    ],
    "background": "#C1E1C1",
    "width": 1080,
    "height": 1080
  },
  {
    "textLayers": [
       {
        "text": "Using an Image URL",
        "textColor": "#000000",
        "fontSize": 80,
        "addTextShadow": true
      }
    ],
    "backgroundImage": "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070"
  },
  {
    "textLayers": [
      {
        "text": "Main Title",
        "textColor": "#FFFFFF",
        "fontSize": 128,
        "fontFamily": "'Playfair Display', serif",
        "addTextShadow": true,
        "textShadowBlur": 5,
        "textAlign": "center",
        "x": 640,
        "y": 200
      },
      {
        "text": "A subtitle describing the content.",
        "textColor": "#EFEFEF",
        "fontSize": 48,
        "fontFamily": "'Inter', sans-serif",
        "textAlign": "center",
        "x": 640,
        "y": 350
      },
      {
        "text": "Bottom-left note",
        "textColor": "#FFFFFF",
        "fontSize": 24,
        "fontFamily": "'Inter', sans-serif",
        "textAlign": "left",
        "x": 50,
        "y": 670
      }
    ],
    "background": "#C1E1C1",
    "width": 1280,
    "height": 720
  }
];

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

    return (
        <AccordionItem value={`item-${index}`}>
            <AccordionTrigger>
                <span className="truncate">Image {index + 1}: {textLayers[0]?.text || "Untitled"}</span>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 p-4 pr-2">
                    <Accordion type="multiple" defaultValue={[`layer-0`]} className="w-full">
                        {textLayers.map((layer: any, layerIndex: number) => (
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`layer-x-${index}-${layerIndex}`}>Position X</Label>
                                            <Input id={`layer-x-${index}-${layerIndex}`} type="number" placeholder={`${config.width/2 || 640}`} value={layer.x} onChange={(e) => onConfigChange('x', e.target.value, layer.id)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`layer-y-${index}-${layerIndex}`}>Position Y</Label>
                                            <Input id={`layer-y-${index}-${layerIndex}`} type="number" placeholder={`${config.height/2 || 360}`} value={layer.y} onChange={(e) => onConfigChange('y', e.target.value, layer.id)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                            <Label htmlFor={`font-size-${index}-${layerIndex}`}>Font Size</Label>
                                            <Input id={`font-size-${index}-${layerIndex}`} type="number" value={layer.fontSize} onChange={(e) => onConfigChange('fontSize', e.target.value, layer.id)} />
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
                        ))}
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
                                <Input id={`bg-color-${index}`} value={config.background} onChange={(e) => onConfigChange('background', e.target.value)} />
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
                            <Input id={`width-${index}`} type="number" value={config.width} onChange={(e) => onConfigChange('width', e.target.value)} />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor={`height-${index}`}>Height</Label>
                            <Input id={`height-${index}`} type="number" value={config.height} onChange={(e) => onConfigChange('height', e.target.value)} />
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

export function BatchEditor() {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleJson, null, 2));
    const [configs, setConfigs] = useState<any[]>(exampleJson);
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

    const { toast } = useToast();

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (Array.isArray(parsed)) {
                setConfigs(parsed.map(c => ({...c, textLayers: c.textLayers && c.textLayers.length > 0 ? c.textLayers.map((l: any, i: number) => ({...l, id: l.id || Date.now() + i})) : [{ text: c.text || "Missing Text", id: Date.now() }]})));
                setJsonError(null);
            } else {
                setJsonError("Input must be a JSON array.");
                setConfigs([]);
            }
        } catch (error: any) {
            setJsonError("Invalid JSON. " + error.message);
            // Don't clear configs on temporary syntax error
        }
    }, [jsonInput]);

    useEffect(() => {
        // Sync configs back to JSON input if there's no error
        if (!jsonError) {
             const newJson = JSON.stringify(configs, (key, value) => key === 'id' ? undefined : value, 2);
             if (newJson !== jsonInput) {
                 // To prevent infinite loops, only update if the stringified version is different
                 // and the parsed versions are also different (deep check is too slow)
                 try {
                    if (JSON.stringify(JSON.parse(jsonInput), (key, value) => key === 'id' ? undefined : value, 2) !== newJson) {
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
                // Add a small delay between downloads to prevent browser blocking
                await new Promise(resolve => setTimeout(resolve, 300));
                await generateAndDownload(configs[i], i + 1);
                toast({
                    title: `Generated Image ${i + 1}/${configs.length}`,
                    description: `Downloading image_${i + 1}.png`,
                });
            } catch (error: any) {
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
            // Attempt to parse to ensure it's valid before setting
            const parsedJson = JSON.parse(result.json);
            setJsonInput(JSON.stringify(parsedJson, null, 2));
            setConfigs(parsedJson);
            toast({
                title: "JSON Generated",
                description: "The configuration has been updated with the AI's response.",
            });
        } catch (error: any) {
            console.error("AI JSON Generation Error:", error);
            const description = error.message.includes('JSON.parse')
                ? "The AI returned invalid JSON. Please try again."
                : error.message || "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "AI Generation Failed",
                description: description,
            });
        } finally {
            setIsGeneratingJson(false);
        }
    };

    const wrapText = (ctx: CanvasRenderingContext2D, text: string): string[] => {
        if (!text) return [];
        return text.split('\n');
    };


    const generateAndDownload = (config: any, index: number) => {
        return new Promise<void>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("Could not get canvas context."));

            const {
                textLayers = [{ text: "Missing Text", textColor: "#000000", fontSize: 64, fontFamily: "'Inter', sans-serif" }],
                background = "#FFFFFF",
                backgroundImage,
                width = 1280,
                height = 720,
            } = config;

            canvas.width = width;
            canvas.height = height;

            const drawBackground = new Promise<void>((resolve) => {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve();
                };
                img.onerror = () => {
                    if (background.includes('gradient')) {
                         const colors = background.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+\%\s*,\s*[\d.]+\%\s*\)/g);
                        if(colors && colors.length >= 2) {
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
                        } else {
                             ctx.fillStyle = '#FFFFFF';
                        }
                    } else {
                         ctx.fillStyle = background;
                    }
                    ctx.fillRect(0, 0, width, height);
                    resolve();
                };

                if (backgroundImage) {
                    img.src = backgroundImage;
                } else {
                    img.onerror(); 
                }
            });

            drawBackground.then(() => {
                const autoPositionedLayers = textLayers.filter((l: any) => l.x === undefined || l.y === undefined);
                const manualPositionedLayers = textLayers.filter((l: any) => l.x !== undefined && l.y !== undefined);

                let totalAutoHeight = 0;
                autoPositionedLayers.forEach((layer: any) => {
                    const lines = wrapText(ctx, layer.text);
                    totalAutoHeight += (lines.length * (layer.fontSize * 1.2)) + (layer.fontSize * 0.5); // Padding
                });
                totalAutoHeight -= (autoPositionedLayers[0]?.fontSize || 0) * 0.5; // No padding before first item

                let currentY = (height - totalAutoHeight) / 2;

                const allLayersToDraw = [...autoPositionedLayers, ...manualPositionedLayers];

                allLayersToDraw.forEach((layer: any) => {
                    const {
                        text, textColor = '#000000', fontSize = 64, fontFamily = "'Inter', sans-serif",
                        textAlign = 'center', letterSpacing = 0, addTextShadow = false,
                        textShadowColor = 'rgba(0,0,0,0.5)', textShadowBlur = 10,
                        textShadowOffsetX = 5, textShadowOffsetY = 5, textStrokeWidth = 0,
                        textStrokeColor = '#000000', addTextBackground = false, textBackgroundColor = 'rgba(0,0,0,0.5)',
                    } = layer;
                    
                    let x, y;
                    const isAuto = layer.x === undefined || layer.y === undefined;

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

                    const lines = wrapText(ctx, text);
                    const lineHeight = fontSize * 1.2;
                    const totalLayerHeight = lines.length * lineHeight;

                    if (isAuto) {
                        x = width / 2;
                        y = currentY + totalLayerHeight / 2;
                        currentY += totalLayerHeight + (fontSize * 0.5);
                    } else {
                        x = layer.x!;
                        y = layer.y!;
                    }

                    let startY = y - totalLayerHeight / 2;

                    lines.forEach((line: string, lineIndex: number) => {
                        const currentLineY = startY + lineIndex * lineHeight + lineHeight / 2;
                        
                        if (addTextBackground) {
                            const textMetrics = ctx.measureText(line);
                            const textWidth = textMetrics.width;
                            const bgPadding = fontSize / 4;
                            const currentShadow = ctx.shadowColor;
                            ctx.shadowColor = 'transparent';
                            ctx.fillStyle = textBackgroundColor;

                            let rectX;
                            if (textAlign === 'left') rectX = x - bgPadding;
                            else if (textAlign === 'right') rectX = x - textWidth - bgPadding;
                            else rectX = x - textWidth / 2 - bgPadding;
                            
                            const rectY = currentLineY - (lineHeight/2) - bgPadding/2;
                            ctx.fillRect(rectX, rectY, textWidth + bgPadding * 2, lineHeight + bgPadding);
                            
                            ctx.shadowColor = currentShadow;
                            ctx.fillStyle = textColor;
                        }

                        if (textStrokeWidth > 0) {
                            ctx.strokeStyle = textStrokeColor;
                            ctx.lineWidth = textStrokeWidth;
                            ctx.strokeText(line, x, currentLineY);
                        }
                        ctx.fillText(line, x, currentLineY);
                    });
                });

                const link = document.createElement('a');
                link.download = `image_${index}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                resolve();
            });
        });
    };

    const handleConfigChange = (index: number, field: string, value: any, layerId?: number) => {
        const newConfigs = [...configs];
        let newConfig = { ...newConfigs[index] };
        
        if (field === 'textLayers' || layerId !== undefined) {
             let targetLayerId = layerId;

             if (targetLayerId !== undefined) {
                 newConfig.textLayers = newConfig.textLayers.map((l:any) => 
                     l.id === targetLayerId ? { ...l, [field]: value } : l
                 );
            } else {
                newConfig.textLayers = value;
            }
        } else {
            newConfig[field] = value;
        }
        
        if (["fontSize", "width", "height", "letterSpacing", "textStrokeWidth", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY", "x", "y"].includes(field)) {
             if (layerId !== undefined) {
                  newConfig.textLayers = newConfig.textLayers.map((l:any) => 
                     l.id === layerId ? { ...l, [field]: value === '' ? undefined : Number(value) } : l
                 );
             } else {
                 newConfig[field] = Number(value);
             }
        }

        if (field === "background") {
            delete newConfig.backgroundImage;
        }

        newConfigs[index] = newConfig;
        setConfigs(newConfigs);
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


    const handleAddImage = () => {
        setConfigs([
            ...configs,
            {
                "textLayers": [{
                    id: Date.now(),
                    "text": "New Image",
                    "textColor": "#000000",
                    "fontSize": 64,
                    "fontFamily": "'Inter', sans-serif",
                    "textAlign": "center"
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
        let newConfigs = configs.map(config => {
            let newConfig = { ...config, [field]: value };
            if (field === 'background' && value) {
                delete newConfig.backgroundImage;
            }
            if (field === 'width' || field === 'height') {
                 newConfig[field] = Number(value);
            }
            return newConfig;
        });
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
        
        const sourceLayerStyles = textLayers[0] ? (({ text, ...rest }) => rest)(textLayers[0]) : {};

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


    const renderPreview = (config: any, index: number) => {
         const {
            textLayers = [],
            background = "#FFFFFF",
            backgroundImage,
            width = 1280,
            height = 720,
        } = config;
        
        const backgroundStyle: React.CSSProperties = backgroundImage ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'var(--card)'
          } : {
            background: background,
          };

        return (
            <div key={index} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">Preview {index + 1}</p>
                <div 
                    className="w-full flex flex-col items-center justify-center shadow-lg rounded-md bg-card-foreground/5 relative overflow-hidden"
                    style={{ ...backgroundStyle, aspectRatio: `${width} / ${height}` }}
                >
                    {textLayers.map((layer:any, i:number) => {
                        const {
                            text = "Missing Text",
                            textColor = "#000000",
                            fontSize = 64,
                            fontFamily = "'Inter', sans-serif",
                            textAlign = "center",
                            letterSpacing = 0,
                            addTextShadow = false,
                            textShadowColor = 'rgba(0,0,0,0.5)',
                            textShadowBlur = 10,
                            textShadowOffsetX = 5,
                            textShadowOffsetY = 5,
                            textStrokeWidth = 0,
                            textStrokeColor = '#000000',
                            addTextBackground = false,
                            textBackgroundColor = 'rgba(0,0,0,0.5)',
                            x,
                            y,
                        } = layer;
                        
                        const xPercent = ((x ?? width / 2) / width) * 100;
                        const yPercent = ((y ?? height / 2) / height) * 100;

                        let transform = 'translateY(-50%)';
                        let left = `${xPercent}%`;
                        if (textAlign === 'center') {
                            transform = 'translateX(-50%) translateY(-50%)';
                        } else if (textAlign === 'right') {
                            transform = 'translateX(-100%) translateY(-50%)';
                        }
                        
                        const textStyle: React.CSSProperties = {
                            position: 'absolute',
                            top: `${yPercent}%`,
                            left: left,
                            transform: transform,
                            color: textColor,
                            fontSize: `${fontSize / 32}rem`,
                            fontFamily: fontFamily,
                            textAlign: textAlign as CanvasTextAlign,
                            lineHeight: 1.2,
                            whiteSpace: 'pre-wrap',
                            padding: '1rem',
                            letterSpacing: `${letterSpacing / 32}rem`,
                            WebkitTextStroke: textStrokeWidth > 0 ? `${textStrokeWidth / 16}rem ${textStrokeColor}` : 'unset',
                            textShadow: addTextShadow ? `${textShadowOffsetX/16}rem ${textShadowOffsetY/16}rem ${textShadowBlur/16}rem ${textShadowColor}` : 'none',
                            backgroundColor: addTextBackground ? textBackgroundColor : 'transparent',
                        };

                        return (
                             <div key={i} style={textStyle}>
                                {text.split('\n').map((line:string, i:number) => <div key={i}>{line || ' '}</div>)}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

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
                        <Label>Font Family</Label>
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
                        <Label>Text Color</Label>
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
             <Button variant="outline" onClick={handleAddImage} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Image
            </Button>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg bg-card-foreground/5">
                 <Label htmlFor="ai-prompt">Generate with AI</Label>
                 <Input 
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Create 5 images for a coffee shop promotion"
                    disabled={isGeneratingJson || isGenerating}
                 />
                 <p className="text-xs text-muted-foreground">Describe the set of images you want to create. The AI will generate the configuration for you.</p>
                 <Button onClick={handleGenerateJson} disabled={isGeneratingJson || isGenerating} className="w-full">
                     {isGeneratingJson ? (
                        <>
                            <Bot className="mr-2 h-4 w-4 animate-spin" />
                            Generating Config...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Config with AI
                        </>
                    )}
                 </Button>
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
                        <Code className="absolute top-3 right-3 text-muted-foreground" />
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
                        {configs.map(renderPreview)}
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
        </div>
    );
}
