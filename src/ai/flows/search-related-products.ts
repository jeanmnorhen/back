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

const ProductSearchResultSchema = z.object({
  objectName: z.string().describe("The original object identified in the image."),
  relatedProducts: z.array(z.string()).describe("A list of products related to this object.")
});

const SearchRelatedProductsOutputSchema = z.object({
  searchResults: z.array(ProductSearchResultSchema).describe("A list of search results, one for each input object that has related products.")
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

Given the following list of objects, for each object, provide its name and a list of related products.
Only include objects in the result if related products are found.
Respond with a JSON object containing a single key "searchResults". The value of "searchResults" should be an array of objects.
Each object in the array must have two fields:
1. "objectName": (string) The name of the identified object.
2. "relatedProducts": (array of strings) A list of products related to this object. If no products are found for an object, do not include that object in the "searchResults" array.

Objects:
{{#each objects}}
- {{{this}}}
{{/each}}

Example for an input of ["expensive car", "tree", "unknown_object_without_products"]:
{
  "searchResults": [
    {
      "objectName": "expensive car",
      "relatedProducts": ["Luxury Sedan Model X", "High-Performance SUV Y", "Exotic Sports Car Z"]
    },
    {
      "objectName": "tree",
      "relatedProducts": ["Gardening Shovel", "Plant Fertilizer", "Outdoor Bench"]
    }
  ]
}
If no products are found for any object, return an empty "searchResults" array:
{
  "searchResults": []
}
`,
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
