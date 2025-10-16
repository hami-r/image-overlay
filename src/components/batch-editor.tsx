"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Code, Bot, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const exampleJson = [
  {
    "text": "Hello World",
    "textColor": "#FFFFFF",
    "background": "linear-gradient(to right, #2b5876, #4e4376)",
    "fontSize": 96
  },
  {
    "text": "Batch\nCreation\nRocks!",
    "textColor": "#000000",
    "background": "#C1E1C1",
    "fontFamily": "'Playfair Display', serif",
    "textAlign": "center"
  }
];

export function BatchEditor() {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleJson, null, 2));
    const [configs, setConfigs] = useState<any[]>(exampleJson);
    const [isGenerating, setIsGenerating] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
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
            setJsonError(error.message);
            setConfigs([]);
        }
    }, [jsonInput]);

    const handleGenerate = async () => {
        if (jsonError) {
             toast({
                variant: "destructive",
                title: "Invalid JSON",
                description: "Please fix the JSON errors before generating images.",
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

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split(' ');
        let lines: string[] = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
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
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                 const colors = background.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
                if(colors && colors.length >= 2) {
                    const direction = background.match(/to (right|left|bottom|top)/);
                    if (direction && direction[1] === 'right') {
                         const gradient = ctx.createLinearGradient(0, 0, width, 0);
                         gradient.addColorStop(0, colors[0]);
                         gradient.addColorStop(1, colors[1]);
                         ctx.fillStyle = gradient;
                    } else {
                        gradient.addColorStop(0, colors[0]);
                        gradient.addColorStop(1, colors[1]);
                        ctx.fillStyle = gradient;
                    }
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

            const manualLines = text.split('\n');
            const padding = 80;
            const maxTextWidth = width - padding;
    
            const lines = manualLines.flatMap((line: string) => wrapText(ctx, line, maxTextWidth));

            const lineHeight = fontSize * 1.2;
            const totalTextHeight = (lines.length) * lineHeight;
            let startY = (height - totalTextHeight) / 2 + (lineHeight/2);
            if (lines.length > 1) {
                startY -= (lineHeight * (lines.length - 1)) / 2
            }


            lines.forEach((line: string, lineIndex: number) => {
                const y = startY + lineIndex * lineHeight;
                let x;
                switch (textAlign) {
                    case 'left': x = 40; break;
                    case 'right': x = width - 40; break;
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

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground mb-2">
                    Define image properties like `text`, `textColor`, `fontSize`, `fontFamily`, `textAlign`, `background`, `width`, and `height`.
                    All properties are optional. See the example below.
                </p>
                <div className="relative">
                    <Textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[ { "text": "My First Image" } ]'
                        rows={15}
                        className="font-code text-sm"
                        disabled={isGenerating}
                    />
                    <Code className="absolute top-3 right-3 text-muted-foreground" />
                </div>
                 {jsonError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Invalid JSON</AlertTitle>
                        <AlertDescription>
                            <pre className="text-xs">{jsonError}</pre>
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !!jsonError}>
                {isGenerating ? (
                    <>
                        <Bot className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : "Generate Images"}
            </Button>
            
            {configs.length > 0 && (
                <div className="space-y-8">
                     <h3 className="text-xl font-semibold">Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {configs.map(renderPreview)}
                    </div>
                </div>
            )}
        </div>
    );
}
