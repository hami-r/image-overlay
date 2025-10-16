'use server';

/**
 * @fileOverview Flow to generate a JSON array for batch image creation from a text prompt.
 *
 * - generateBatchJson - A function that generates a JSON array based on a text prompt.
 * - GenerateBatchJsonInput - The input type for the generateBatchJson function.
 * - GenerateBatchJsonOutput - The return type for the generateBatchJson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {fontFamilies} from '@/lib/fonts';

const GenerateBatchJsonInputSchema = z.object({
  prompt: z
    .string()
    .describe('The text prompt to generate the JSON array from.'),
});
export type GenerateBatchJsonInput = z.infer<
  typeof GenerateBatchJsonInputSchema
>;

const GenerateBatchJsonOutputSchema = z.object({
  json: z
    .string()
    .describe(
      'The generated JSON array as a string. The JSON should be well-formed and ready to be parsed.'
    ),
});
export type GenerateBatchJsonOutput = z.infer<
  typeof GenerateBatchJsonOutputSchema
>;

export async function generateBatchJson(
  input: GenerateBatchJsonInput
): Promise<GenerateBatchJsonOutput> {
  return generateBatchJsonFlow(input);
}

const FONT_FAMILY_NAMES = fontFamilies.map(f => f.name).join(', ');

const prompt = ai.definePrompt({
  name: 'generateBatchJsonPrompt',
  input: {schema: GenerateBatchJsonInputSchema},
  output: {schema: GenerateBatchJsonOutputSchema},
  prompt: `You are an expert at creating JSON configurations for generating images.
A user will provide a prompt, and you must generate a valid JSON array of objects based on their request.
Each object in the array represents an image to be created and can have the following properties:
- text: string (the main text for the overlay)
- textColor: string (hex color code, e.g., "#FFFFFF")
- fontSize: number (e.g., 64)
- fontFamily: string (must be one of the available fonts)
- textAlign: 'left' | 'center' | 'right'
- background: string (hex color code or a CSS linear-gradient)
- width: number (e.g., 1280)
- height: number (e.g., 720)

Available font families: ${FONT_FAMILY_NAMES}
Default font is 'Inter'.

Your response MUST be a single, valid, pretty-printed JSON string representing the array. Do not include any other text, explanations, or markdown code fences.

User Prompt: {{{prompt}}}
`,
});

const generateBatchJsonFlow = ai.defineFlow(
  {
    name: 'generateBatchJsonFlow',
    inputSchema: GenerateBatchJsonInputSchema,
    outputSchema: GenerateBatchJsonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const jsonResponse = output!.json;

    // Basic cleanup to remove potential markdown fences
    const cleanedJson = jsonResponse.replace(/```json\n/g, '').replace(/```/g, '');

    // Validate that the output is valid JSON before returning
    try {
      JSON.parse(cleanedJson);
      return { json: cleanedJson };
    } catch (e: any) {
        // In case the model still returns invalid JSON, we'll try to recover
        // or throw an error. For now, we'll just re-prompt. This could be a loop.
        const { output: retryOutput } = await prompt({prompt: `The last response was not valid JSON. Please provide a valid, pretty-printed JSON array string only. User prompt: ${input.prompt}`});
        return { json: retryOutput!.json.replace(/```json\n/g, '').replace(/```/g, '') };
    }
  }
);
