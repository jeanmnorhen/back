// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview Extracts key properties for a given list of products using AI.
 *
 * - extractProductProperties - A function that handles the extraction of product properties.
 * - ExtractProductPropertiesInput - The input type for the extractProductProperties function.
 * - ExtractProductPropertiesOutput - The return type for the extractProductProperties function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProductPropertiesInputSchema = z.array(
  z.string().describe('A product name or description.')
);
export type ExtractProductPropertiesInput = z.infer<
  typeof ExtractProductPropertiesInputSchema
>;

const ExtractProductPropertiesOutputSchema = z.array(
  z.object({
    product: z.string().describe('The product name or description.'),
    properties: z.array(
      z
        .string()
        .describe('A key property of the product, e.g., "color", "size", "material".')
    ),
  })
);
export type ExtractProductPropertiesOutput = z.infer<
  typeof ExtractProductPropertiesOutputSchema
>;

export async function extractProductProperties(
  input: ExtractProductPropertiesInput
): Promise<ExtractProductPropertiesOutput> {
  return extractProductPropertiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProductPropertiesPrompt',
  input: {schema: ExtractProductPropertiesInputSchema},
  output: {schema: ExtractProductPropertiesOutputSchema},
  prompt: `You are an expert product analyst. Given a list of products, you will identify key properties for each product.

Products:
{{#each this}}
- {{{this}}}
{{/each}}

For each product, list at least three key properties, such as "color", "size", "material", "brand", etc.
`,
});

const extractProductPropertiesFlow = ai.defineFlow(
  {
    name: 'extractProductPropertiesFlow',
    inputSchema: ExtractProductPropertiesInputSchema,
    outputSchema: ExtractProductPropertiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
