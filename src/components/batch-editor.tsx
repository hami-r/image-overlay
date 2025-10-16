"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Code, Bot } from 'lucide-react';

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
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        let configs;
        try {
            configs = JSON.parse(jsonInput);
            if (!Array.isArray(configs)) {
                throw new Error("Input must be a JSON array.");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Invalid JSON",
                description: error.message,
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
                const gradient = ctx.createLinearGradient(0, 0, width, 0);
                 const colors = background.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
                if(colors && colors.length >= 2) {
                    gradient.addColorStop(0, colors[0]);
                    gradient.addColorStop(1, colors[1]);
                }
                ctx.fillStyle = gradient;
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
            const totalTextHeight = (lines.length - 1) * lineHeight;
            let startY = (height - totalTextHeight) / 2;

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

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
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
            <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                    <>
                        <Bot className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : "Generate Images"}
            </Button>
        </div>
    );
}
