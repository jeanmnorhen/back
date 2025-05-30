'use server';
/**
 * @fileOverview Ferramenta Genkit para encontrar lojas que vendem um determinado produto.
 *
 * - findStoresTool - A definição da ferramenta Genkit.
 * - FindStoresToolInputSchema - O esquema de entrada para a ferramenta.
 * - FindStoresToolOutputSchema - O esquema de saída para a ferramenta.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FindStoresToolInputSchema = z.object({
  productName: z.string().describe('O nome do produto para o qual encontrar lojas.'),
});
export type FindStoresToolInput = z.infer<typeof FindStoresToolInputSchema>;

export const FindStoresToolOutputSchema = z.object({
  stores: z.array(z.string()).describe('Uma lista de nomes de lojas que vendem o produto.'),
});
export type FindStoresToolOutput = z.infer<typeof FindStoresToolOutputSchema>;

export const findStoresTool = ai.defineTool(
  {
    name: 'findStoresTool',
    description: 'Busca e retorna uma lista de lojas que vendem um produto específico. Use esta ferramenta quando o usuário perguntar onde comprar um produto.',
    inputSchema: FindStoresToolInputSchema,
    outputSchema: FindStoresToolOutputSchema,
  },
  async ({ productName }) => {
    // Implementação simulada (mock)
    // No futuro, isso poderia consultar um banco de dados ou uma API externa.
    console.log(`[findStoresTool] Buscando lojas para: ${productName}`);
    let mockStores: string[] = [];

    const lowerProductName = productName.toLowerCase();

    if (lowerProductName.includes('coca-cola')) {
      mockStores = ['Supermercado Central', 'Loja da Esquina', 'Mercado Preço Bom', 'Distribuidora de Bebidas XYZ'];
    } else if (lowerProductName.includes('sabão em pó') || lowerProductName.includes('detergente')) {
      mockStores = ['Supermercado Central', 'Mercado Preço Bom', 'Atacadão Limpeza'];
    } else if (lowerProductName.includes('notebook') || lowerProductName.includes('laptop') || lowerProductName.includes('smartphone')) {
      mockStores = ['Tech Store XYZ', 'Magazine Luiza', 'Casas Bahia', 'Fast Shop'];
    } else if (lowerProductName.includes('livro')) {
      mockStores = ['Livraria Cultura', 'Amazon Books', 'Saraiva'];
    } else {
      mockStores = ['Loja Variedades Online', 'Depósito Geral'];
    }

    // Simular alguns produtos não encontrados em nenhuma loja
    if (lowerProductName.includes('flux capacitor') || lowerProductName.includes('unobtainium')) {
      mockStores = [];
    }
    
    console.log(`[findStoresTool] Lojas encontradas para ${productName}: ${mockStores.join(', ')}`);
    return { stores: mockStores };
  }
);
