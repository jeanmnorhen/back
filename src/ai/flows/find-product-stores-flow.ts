
'use server';
/**
 * @fileOverview Fluxo Genkit para encontrar lojas que vendem um produto específico usando uma ferramenta.
 *
 * - findProductStores - Função wrapper que executa o fluxo.
 * - FindProductStoresInput - Tipo de entrada para o fluxo.
 * - FindProductStoresOutput - Tipo de saída para o fluxo.
 */

import { ai } from '@/ai/genkit';
import { findStoresTool } from '@/ai/tools/find-stores-tool'; // Import the tool directly
import { z } from 'genkit';

const _FindProductStoresInputSchema = z.object({
  productName: z.string().describe('O nome do produto para o qual encontrar lojas.'),
  latitude: z.number().optional().describe('A latitude da localização do usuário (opcional).'),
  longitude: z.number().optional().describe('A longitude da localização do usuário (opcional).'),
});
export type FindProductStoresInput = z.infer<typeof _FindProductStoresInputSchema>;

const _FindProductStoresOutputSchema = z.object({
  productName: z.string().describe('O nome do produto para o qual as lojas foram pesquisadas.'),
  foundStores: z.array(z.string()).describe('Uma lista de lojas que supostamente vendem o produto. Esta lista vem da findStoresTool.'),
});
export type FindProductStoresOutput = z.infer<typeof _FindProductStoresOutputSchema>;

export async function findProductStores(input: FindProductStoresInput): Promise<FindProductStoresOutput> {
  return findProductStoresFlow(input);
}

const findStoresPrompt = ai.definePrompt({
  name: 'findStoresPrompt',
  input: { schema: _FindProductStoresInputSchema },
  output: { schema: _FindProductStoresOutputSchema },
  tools: [findStoresTool],
  prompt: `Você é um assistente de IA encarregado de encontrar lojas que vendem um determinado produto.
Nome do Produto: {{{productName}}}
{{#if latitude}}
Localização do Usuário: Latitude {{{latitude}}}, Longitude {{{longitude}}}
Utilize a ferramenta 'findStoresTool' para obter uma lista de lojas para este produto. Se a localização do usuário for fornecida, a ferramenta pode usá-la para encontrar lojas próximas.
{{else}}
Use a ferramenta 'findStoresTool' para obter uma lista de lojas para este produto.
{{/if}}

Se a ferramenta retornar lojas, sua resposta DEVE incluir o nome do produto original e a lista de lojas retornada pela ferramenta.
Se a ferramenta retornar uma lista vazia de lojas, sua resposta DEVE indicar que nenhuma loja foi encontrada para o produto, mas ainda assim incluir o nome do produto.

A saída final DEVE ser um objeto JSON estruturado de acordo com este esquema:
{
  "productName": "O nome original do produto que você recebeu",
  "foundStores": ["Loja A", "Loja B", "..."] // Esta é a lista de lojas da findStoresTool. Pode ser uma lista vazia se nenhuma loja for encontrada.
}

Exemplo se lojas forem encontradas (e localização não usada explicitamente na saída do prompt):
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
    inputSchema: _FindProductStoresInputSchema,
    outputSchema: _FindProductStoresOutputSchema,
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

