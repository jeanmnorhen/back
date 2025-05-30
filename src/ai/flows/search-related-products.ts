// src/ai/flows/search-related-products.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for searching products related to identified objects.
 *
 * - searchRelatedProducts - A function that takes a list of objects and returns a list of related products for each object.
 * - SearchRelatedProductsInput - The input type for the searchRelatedProducts function.
 * - SearchRelatedProductsOutput - The return type for the searchRelatedProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchRelatedProductsInputSchema = z.object({
  objects: z.array(z.string()).describe('A list of identified objects from the image.'),
});
export type SearchRelatedProductsInput = z.infer<typeof SearchRelatedProductsInputSchema>;

const SearchRelatedProductsOutputSchema = z.object({
  products: z.record(z.array(z.string())).describe('A list of related products for each object.'),
});
export type SearchRelatedProductsOutput = z.infer<typeof SearchRelatedProductsOutputSchema>;

export async function searchRelatedProducts(input: SearchRelatedProductsInput): Promise<SearchRelatedProductsOutput> {
  return searchRelatedProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchRelatedProductsPrompt',
  input: {schema: SearchRelatedProductsInputSchema},
  output: {schema: SearchRelatedProductsOutputSchema},
  prompt: `You are an AI assistant that helps users find products related to objects identified in an image.

  Given the following list of objects, search for related products for each object and return a list of products related to each object.  Respond in JSON format.

  Objects:
  {{#each objects}}
  - {{{this}}}
  {{/each}}`,
});

const searchRelatedProductsFlow = ai.defineFlow(
  {
    name: 'searchRelatedProductsFlow',
    inputSchema: SearchRelatedProductsInputSchema,
    outputSchema: SearchRelatedProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
