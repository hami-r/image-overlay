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
import { AlignLeft, AlignCenter, AlignRight, CaseUpper, CaseLower, Pilcrow, Heading1, Upload, Download, Sparkles, Bot, Shuffle } from 'lucide-react';
import { generateBackgroundImage } from '@/ai/flows/generate-background-image';
import { useToast } from '@/hooks/use-toast';

type CaseType = 'normal' | 'uppercase' | 'lowercase' | 'titlecase' | 'pascalcase';

export function ImageEditor() {
  const [text, setText] = useState('Your Text Here');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(64);
  const [fontFamily, setFontFamily] = useState(fontFamilies[0].family);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textCase, setTextCase] = useState<CaseType>('normal');
  const [background, setBackground] = useState(backgroundPatterns[0].value);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [addTextBackground, setAddTextBackground] = useState(false);
  const [textBackgroundColor, setTextBackgroundColor] = useState('rgba(0, 0, 0, 0.5)');
  
  const [aiPrompt, setAiPrompt] = useState('A beautiful sunset over mountains');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewDim, setPreviewDim] = useState({ width: 1280, height: 720 });

  const transformText = useCallback((inputText: string, caseType: CaseType) => {
    switch (caseType) {
      case 'uppercase':
        return inputText.toUpperCase();
      case 'lowercase':
        return inputText.toLowerCase();
      case 'titlecase':
        return inputText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      case 'pascalcase':
        return inputText.replace(/(?:^|\s)\w/g, (match) => match.trim().toUpperCase()).replace(/\s/g, '');
      case 'normal':
      default:
        return inputText;
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setPreviewDim({ width: img.width, height: img.height });
          setUploadedImage(result);
          setBackground(''); // Deselect any color/pattern
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
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
            setUploadedImage(dataUri);
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
      if (uploadedImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.onerror = () => resolve(); // continue even if image fails
        img.src = uploadedImage;
      } else {
        ctx.fillStyle = background.includes('gradient') ? '#F0F0F0' : background;
        if(background.includes('gradient')) {
            const colors = background.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
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
        const finalFont = `${fontSize}px ${fontFamily}`;
        ctx.font = finalFont;
        ctx.fillStyle = textColor;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';

        const transformedText = transformText(text, textCase);
        const manualLines = transformedText.split('\n');
        const padding = 80;
        const maxTextWidth = width - padding;

        const lines = manualLines.flatMap(line => wrapText(ctx, line, maxTextWidth));

        const lineHeight = fontSize * 1.2;
        const totalTextHeight = (lines.length - 1) * lineHeight;
        
        let startY = (height - totalTextHeight) / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            let x;
            switch(textAlign) {
                case 'left': x = 40; break;
                case 'right': x = width - 40; break;
                case 'center': default: x = width / 2; break;
            }

            if(addTextBackground) {
                const textMetrics = ctx.measureText(line);
                const textWidth = textMetrics.width;
                const bgPadding = fontSize / 4;
                ctx.fillStyle = textBackgroundColor;
                
                let rectX;
                if (textAlign === 'center') {
                    rectX = x - textWidth / 2 - bgPadding;
                } else if (textAlign === 'left') {
                    rectX = x - bgPadding;
                } else { // right
                    rectX = x - textWidth - bgPadding;
                }
                
                const rectY = y - (lineHeight/2) - bgPadding/2;
                ctx.fillRect(rectX, rectY, textWidth + bgPadding * 2, lineHeight + bgPadding);
                ctx.fillStyle = textColor;
            }
            ctx.fillText(line, x, y);
        });

        const link = document.createElement('a');
        link.download = 'image-overlay.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
  };

  const handleRandomBackground = () => {
    const randomIndex = Math.floor(Math.random() * backgroundPatterns.length);
    const randomBg = backgroundPatterns[randomIndex].value;
    setBackground(randomBg);
    setUploadedImage(null);
    setPreviewDim({width: 1280, height: 720});
  }
  
  const backgroundStyle: React.CSSProperties = uploadedImage ? {
    backgroundImage: `url(${uploadedImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: 'var(--card)'
  } : {
    background: background,
  };

  const textStyle: React.CSSProperties = {
    color: textColor,
    fontSize: `${fontSize / 32}rem`, // Scale font size for preview
    fontFamily: fontFamily,
    textAlign: textAlign,
    lineHeight: 1.2,
    whiteSpace: 'pre-wrap',
    padding: '1rem',
    wordBreak: 'break-word',
  };

  const textContainerStyle: React.CSSProperties = {
      backgroundColor: addTextBackground ? textBackgroundColor : 'transparent',
      borderRadius: '0.25rem'
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Customize Your Image</CardTitle>
          <CardDescription>Adjust the settings to create your perfect image overlay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text-input">Overlay Text</Label>
            <Textarea id="text-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Your text here" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <Input id="text-color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="p-1 h-10"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="font-family"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fontFamilies.map(font => <SelectItem key={font.name} value={font.family} style={{ fontFamily: font.family }}>{font.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Font Size: {fontSize}px</Label>
            <Slider value={[fontSize]} onValueChange={([val]) => setFontSize(val)} min={16} max={256} step={1} />
          </div>

          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <ToggleGroup type="single" value={textAlign} onValueChange={(val: 'left' | 'center' | 'right') => val && setTextAlign(val)} className="w-full">
              <ToggleGroupItem value="left" className="w-full"><AlignLeft /></ToggleGroupItem>
              <ToggleGroupItem value="center" className="w-full"><AlignCenter /></ToggleGroupItem>
              <ToggleGroupItem value="right" className="w-full"><AlignRight /></ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Text Case</Label>
             <Select value={textCase} onValueChange={(v: CaseType) => setTextCase(v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="normal"><span className="flex items-center gap-2"><Pilcrow className="w-4 h-4"/> Normal</span></SelectItem>
                    <SelectItem value="uppercase"><span className="flex items-center gap-2"><CaseUpper className="w-4 h-4"/> UPPERCASE</span></SelectItem>
                    <SelectItem value="lowercase"><span className="flex items-center gap-2"><CaseLower className="w-4 h-4"/> lowercase</span></SelectItem>
                    <SelectItem value="titlecase"><span className="flex items-center gap-2"><Heading1 className="w-4 h-4"/> Title Case</span></SelectItem>
                    <SelectItem value="pascalcase"><span className="flex items-center gap-2"><Pilcrow className="w-4 h-4"/> PascalCase</span></SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
             <div className="space-y-0.5">
                <Label>Text Background</Label>
                <p className="text-xs text-muted-foreground">Improves text readability on complex backgrounds.</p>
             </div>
             <Switch checked={addTextBackground} onCheckedChange={setAddTextBackground} />
          </div>
          {addTextBackground && (
             <div className="space-y-2">
              <Label htmlFor="text-bg-color">Text BG Color</Label>
              <Input id="text-bg-color" type="color" value={textBackgroundColor} onChange={(e) => setTextBackgroundColor(e.target.value)} className="p-1 h-10"/>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Image Background</Label>
                <Button variant="ghost" size="sm" onClick={handleRandomBackground}>
                    <Shuffle className="w-4 h-4 mr-2"/>
                    Random
                </Button>
            </div>
            <Tabs defaultValue="pattern">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pattern">Color/Pattern</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="ai">Generate AI</TabsTrigger>
                </TabsList>
                <TabsContent value="pattern" className="pt-4">
                    <div className="grid grid-cols-5 gap-2">
                        {backgroundPatterns.map(p => (
                            <button key={p.name} title={p.name} onClick={() => { setBackground(p.value); setUploadedImage(null); setPreviewDim({width:1280, height: 720}) }} className={ `w-full h-10 rounded-md border-2 ${ (background === p.value && !uploadedImage) ? 'border-ring' : 'border-transparent'}` } style={{ background: p.value }} />
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
        </CardContent>
      </Card>
      
      <div className="lg:col-span-8 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center bg-card-foreground/5 p-4">
            <div
              className="w-full flex items-center justify-center shadow-lg"
              style={{ ...backgroundStyle, aspectRatio: `${previewDim.width} / ${previewDim.height}` }}
            >
              <div style={textContainerStyle}>
                <p style={textStyle}>
                  {transformText(text, textCase)}
                </p>
              </div>
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
