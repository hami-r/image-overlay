'use server';

/**
 * @fileOverview Flow to generate a background image from a text prompt.
 *
 * - generateBackgroundImage - A function that generates a background image based on a text prompt.
 * - GenerateBackgroundImageInput - The input type for the generateBackgroundImage function.
 * - GenerateBackgroundImageOutput - The return type for the generateBackgroundImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBackgroundImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the background image from.'),
});
export type GenerateBackgroundImageInput = z.infer<typeof GenerateBackgroundImageInputSchema>;

const GenerateBackgroundImageOutputSchema = z.object({
  backgroundImageDataUri: z
    .string()
    .describe(
      'The generated background image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type GenerateBackgroundImageOutput = z.infer<typeof GenerateBackgroundImageOutputSchema>;

export async function generateBackgroundImage(
  input: GenerateBackgroundImageInput
): Promise<GenerateBackgroundImageOutput> {
  return generateBackgroundImageFlow(input);
}

const generateBackgroundImagePrompt = ai.definePrompt({
  name: 'generateBackgroundImagePrompt',
  input: {schema: GenerateBackgroundImageInputSchema},
  output: {schema: GenerateBackgroundImageOutputSchema},
  prompt: `Generate a background image based on the following prompt: {{{prompt}}}. Return the image as a data URI.`, // prettier-ignore
});

const generateBackgroundImageFlow = ai.defineFlow(
  {
    name: 'generateBackgroundImageFlow',
    inputSchema: GenerateBackgroundImageInputSchema,
    outputSchema: GenerateBackgroundImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });

    return {
      backgroundImageDataUri: media!.url,
    };
  }
);
