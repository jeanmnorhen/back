'use server';

/**
 * @fileOverview An object identification AI agent.
 *
 * - identifyObjects - A function that handles the object identification process.
 * - IdentifyObjectsInput - The input type for the identifyObjects function.
 * - IdentifyObjectsOutput - The return type for the identifyObjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyObjectsInput = z.infer<typeof IdentifyObjectsInputSchema>;

const IdentifyObjectsOutputSchema = z.object({
  objects: z
    .array(z.string())
    .describe('The objects identified in the image.'),
});
export type IdentifyObjectsOutput = z.infer<typeof IdentifyObjectsOutputSchema>;

export async function identifyObjects(input: IdentifyObjectsInput): Promise<IdentifyObjectsOutput> {
  return identifyObjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyObjectsPrompt',
  input: {schema: IdentifyObjectsInputSchema},
  output: {schema: IdentifyObjectsOutputSchema},
  prompt: `You are an expert in computer vision. You will identify the objects in the image.

Use the following image as the primary source of information.

Image: {{media url=photoDataUri}}

List the objects identified in the image.`,
});

const identifyObjectsFlow = ai.defineFlow(
  {
    name: 'identifyObjectsFlow',
    inputSchema: IdentifyObjectsInputSchema,
    outputSchema: IdentifyObjectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
