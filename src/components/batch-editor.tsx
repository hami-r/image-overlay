"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Code, Bot, AlertTriangle, Sparkles, Trash2, PlusCircle, FormInput, Shuffle } from 'lucide-react';
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

const exampleJson = [
  {
    "text": "Hello World",
    "textColor": "#FFFFFF",
    "background": "linear-gradient(to right, #2b5876, #4e4376)",
    "fontSize": 96,
    "width": 1280,
    "height": 720,
    "fontFamily": "'Inter', sans-serif",
    "textAlign": "center"
  },
  {
    "text": "Batch\nCreation\nRocks!",
    "textColor": "#000000",
    "background": "#C1E1C1",
    "fontSize": 64,
    "width": 1080,
    "height": 1080,
    "fontFamily": "'Playfair Display', serif",
    "textAlign": "center"
  }
];

export function BatchEditor() {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleJson, null, 2));
    const [configs, setConfigs] = useState<any[]>(exampleJson);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingJson, setIsGeneratingJson] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('Create 3 images for a motivational social media post');
    const { toast } = useToast();

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (Array.isArray(parsed)) {
                setConfigs(parsed);
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
             const newJson = JSON.stringify(configs, null, 2);
             if (newJson !== jsonInput) {
                 setJsonInput(newJson);
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

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
        if (!text) return [];
        const words = text.split(' ');
        let lines: string[] = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth && !word.includes('\n')) {
                currentLine += " " + word;
            } else {
                const subWords = word.split('\n');
                for (let j = 0; j < subWords.length; j++) {
                    if (j > 0) {
                        lines.push(currentLine);
                        currentLine = subWords[j];
                    } else {
                        const newWidth = ctx.measureText(currentLine + " " + subWords[j]).width;
                        if (newWidth < maxWidth) {
                            currentLine += " " + subWords[j];
                        } else {
                            lines.push(currentLine);
                            currentLine = subWords[j];
                        }
                    }
                }
            }
        }
        lines.push(currentLine);
        return lines.flatMap(line => line.split('\n'));
    };


    const generateAndDownload = (config: any, index: number) => {
        return new Promise<void>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("Could not get canvas context."));

            const {
                text = "Missing Text",
                textColor = "#000000",
                fontSize = 64,
                fontFamily = "'Inter', sans-serif",
                textAlign = "center",
                background = "#FFFFFF",
                width = 1280,
                height = 720
            } = config;

            canvas.width = width;
            canvas.height = height;

            // Draw background
            if (background.includes('gradient')) {
                 const colors = background.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
                if(colors && colors.length >= 2) {
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
            } else {
                 ctx.fillStyle = background;
            }
            ctx.fillRect(0, 0, width, height);

            // Draw text
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = textAlign as CanvasTextAlign;
            ctx.textBaseline = 'middle';

            const padding = 80;
            const maxTextWidth = width - padding;
            const lines = wrapText(ctx, text, maxTextWidth);

            const lineHeight = fontSize * 1.2;
            const totalTextHeight = (lines.length - 1) * lineHeight;
            let startY = (height - totalTextHeight) / 2;

            lines.forEach((line: string, lineIndex: number) => {
                const y = startY + lineIndex * lineHeight;
                let x;
                switch (textAlign) {
                    case 'left': x = padding / 2; break;
                    case 'right': x = width - (padding / 2); break;
                    case 'center': default: x = width / 2; break;
                }
                ctx.fillText(line, x, y);
            });

            // Trigger download
            const link = document.createElement('a');
            link.download = `image_${index}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            resolve();
        });
    };

    const handleConfigChange = (index: number, field: string, value: any) => {
        const newConfigs = [...configs];
        const newConfig = { ...newConfigs[index], [field]: value };
        
        if (field === "fontSize" || field === "width" || field === "height") {
            newConfig[field] = Number(value);
        }

        newConfigs[index] = newConfig;
        setConfigs(newConfigs);
    };

    const handleAddImage = () => {
        setConfigs([
            ...configs,
            {
                "text": "New Image",
                "textColor": "#000000",
                "background": "#FFFFFF",
                "fontSize": 64,
                "width": 1280,
                "height": 720,
                "fontFamily": "'Inter', sans-serif",
                "textAlign": "center"
            }
        ]);
    };

    const handleRemoveImage = (index: number) => {
        const newConfigs = configs.filter((_, i) => i !== index);
        setConfigs(newConfigs);
    };

    const handleRandomBackground = (index: number) => {
        const randomIndex = Math.floor(Math.random() * backgroundPatterns.length);
        handleConfigChange(index, 'background', backgroundPatterns[randomIndex].value)
    }

    const renderPreview = (config: any, index: number) => {
         const {
            text = "Missing Text",
            textColor = "#000000",
            fontSize = 64,
            fontFamily = "'Inter', sans-serif",
            textAlign = "center",
            background = "#FFFFFF",
            width = 1280,
            height = 720
        } = config;

        const backgroundStyle: React.CSSProperties = { background };
        const textStyle: React.CSSProperties = {
            color: textColor,
            fontSize: `${fontSize / 32}rem`,
            fontFamily: fontFamily,
            textAlign: textAlign as CanvasTextAlign,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
            padding: '1rem',
            wordBreak: 'break-word',
        };

        return (
            <div key={index} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">Preview {index + 1}</p>
                <div 
                    className="w-full flex items-center justify-center shadow-lg rounded-md bg-card-foreground/5"
                    style={{ ...backgroundStyle, aspectRatio: `${width} / ${height}` }}
                >
                    <div>
                        <p style={textStyle}>{text}</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderForm = () => (
        <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                {configs.map((config, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                            <span className="truncate">Image {index + 1}: {config.text || "Untitled"}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                             <div className="space-y-4 p-4 pr-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`text-${index}`}>Text</Label>
                                    <Textarea id={`text-${index}`} value={config.text} onChange={(e) => handleConfigChange(index, 'text', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`text-color-${index}`}>Text Color</Label>
                                        <Input id={`text-color-${index}`} type="color" value={config.textColor} onChange={(e) => handleConfigChange(index, 'textColor', e.target.value)} className="p-1 h-10"/>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor={`bg-color-${index}`}>Background</Label>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRandomBackground(index)}>
                                                <Shuffle className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                        <Input id={`bg-color-${index}`} value={config.background} onChange={(e) => handleConfigChange(index, 'background', e.target.value)} />
                                         <div className="grid grid-cols-5 gap-1 pt-1">
                                            {backgroundPatterns.map(p => (
                                                <button key={p.name} title={p.name} onClick={() => handleConfigChange(index, 'background', p.value)} className={`w-full h-6 rounded-sm border-2 ${config.background === p.value ? 'border-ring' : 'border-transparent'}`} style={{background: p.value}} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Font</Label>
                                    <Select value={config.fontFamily} onValueChange={(v) => handleConfigChange(index, 'fontFamily', v)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {fontFamilies.map(f => <SelectItem key={f.name} value={f.family} style={{fontFamily: f.family}}>{f.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor={`font-size-${index}`}>Font Size</Label>
                                        <Input id={`font-size-${index}`} type="number" value={config.fontSize} onChange={(e) => handleConfigChange(index, 'fontSize', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Alignment</Label>
                                        <ToggleGroup type="single" value={config.textAlign} onValueChange={(v) => v && handleConfigChange(index, 'textAlign', v)} className="w-full">
                                            <ToggleGroupItem value="left" className="w-full"><AlignLeft/></ToggleGroupItem>
                                            <ToggleGroupItem value="center" className="w-full"><AlignCenter/></ToggleGroupItem>
                                            <ToggleGroupItem value="right" className="w-full"><AlignRight/></ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor={`width-${index}`}>Width</Label>
                                        <Input id={`width-${index}`} type="number" value={config.width} onChange={(e) => handleConfigChange(index, 'width', e.target.value)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor={`height-${index}`}>Height</Label>
                                        <Input id={`height-${index}`} type="number" value={config.height} onChange={(e) => handleConfigChange(index, 'height', e.target.value)} />
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleRemoveImage(index)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Remove Image
                                </Button>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
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
                            <AlertTitle>Invalid JSON</AlertTitle>
                            <AlertDescription>
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
        </div>
    );
}
