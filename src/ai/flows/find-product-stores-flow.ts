'use server';
/**
 * @fileOverview Fluxo Genkit para encontrar lojas que vendem um produto específico usando uma ferramenta.
 *
 * - findProductStores - Função wrapper que executa o fluxo.
 * - FindProductStoresInput - Tipo de entrada para o fluxo.
 * - FindProductStoresOutput - Tipo de saída para o fluxo.
 */

import { ai } from '@/ai/genkit';
import { findStoresTool, FindStoresToolInputSchema, FindStoresToolOutputSchema } from '@/ai/tools/find-stores-tool';
import { z } from 'genkit';

export const FindProductStoresInputSchema = z.object({
  productName: z.string().describe('O nome do produto para o qual encontrar lojas.'),
});
export type FindProductStoresInput = z.infer<typeof FindProductStoresInputSchema>;

export const FindProductStoresOutputSchema = z.object({
  productName: z.string().describe('O nome do produto para o qual as lojas foram pesquisadas.'),
  foundStores: z.array(z.string()).describe('Uma lista de lojas que supostamente vendem o produto. Esta lista vem da findStoresTool.'),
});
export type FindProductStoresOutput = z.infer<typeof FindProductStoresOutputSchema>;

export async function findProductStores(input: FindProductStoresInput): Promise<FindProductStoresOutput> {
  return findProductStoresFlow(input);
}

const findStoresPrompt = ai.definePrompt({
  name: 'findStoresPrompt',
  input: { schema: FindProductStoresInputSchema },
  output: { schema: FindProductStoresOutputSchema },
  tools: [findStoresTool],
  prompt: `Você é um assistente de IA encarregado de encontrar lojas que vendem um determinado produto.
Nome do Produto: {{{productName}}}

Use a ferramenta 'findStoresTool' para obter uma lista de lojas para este produto.
Se a ferramenta retornar lojas, sua resposta DEVE incluir o nome do produto original e a lista de lojas retornada pela ferramenta.
Se a ferramenta retornar uma lista vazia de lojas, sua resposta DEVE indicar que nenhuma loja foi encontrada para o produto, mas ainda assim incluir o nome do produto.

A saída final DEVE ser um objeto JSON estruturado de acordo com este esquema:
{
  "productName": "O nome original do produto que você recebeu",
  "foundStores": ["Loja A", "Loja B", "..."] // Esta é a lista de lojas da findStoresTool. Pode ser uma lista vazia se nenhuma loja for encontrada.
}

Exemplo se lojas forem encontradas:
{
  "productName": "Coca-Cola 2 Litros",
  "foundStores": ["Supermercado Central", "Loja da Esquina"]
}

Exemplo se NENHUMA loja for encontrada:
{
  "productName": "Flux Capacitor",
  "foundStores": []
}
`,
});

const findProductStoresFlow = ai.defineFlow(
  {
    name: 'findProductStoresFlow',
    inputSchema: FindProductStoresInputSchema,
    outputSchema: FindProductStoresOutputSchema,
  },
  async (input) => {
    const { output } = await findStoresPrompt(input);
    
    // O LLM é instruído a retornar um output válido mesmo que a ferramenta não encontre lojas.
    // Se o output for inesperadamente nulo (o que não deveria acontecer com um bom prompt e output schema),
    // retornamos um valor padrão.
    if (!output) {
      console.warn(`[findProductStoresFlow] O prompt findStoresPrompt retornou um output nulo para o produto: ${input.productName}. Retornando stores vazias.`);
      return { productName: input.productName, foundStores: [] };
    }
    
    return output;
  }
);
