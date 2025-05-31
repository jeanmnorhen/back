
/**
 * @fileOverview Ferramenta Genkit para encontrar lojas que vendem um determinado produto.
 *
 * - findStoresTool - A definição da ferramenta Genkit.
 * - FindStoresToolInput - O tipo de entrada para a ferramenta (schema é interno).
 * - FindStoresToolOutput - O tipo de saída para a ferramenta (schema é interno).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const _FindStoresToolInputSchema = z.object({
  productName: z.string().describe('O nome do produto para o qual encontrar lojas.'),
  latitude: z.number().optional().describe('A latitude da localização do usuário (opcional).'),
  longitude: z.number().optional().describe('A longitude da localização do usuário (opcional).'),
});
export type FindStoresToolInput = z.infer<typeof _FindStoresToolInputSchema>;

const _FindStoresToolOutputSchema = z.object({
  stores: z.array(z.string()).describe('Uma lista de nomes de lojas que vendem o produto.'),
});
export type FindStoresToolOutput = z.infer<typeof _FindStoresToolOutputSchema>;

export const findStoresTool = ai.defineTool(
  {
    name: 'findStoresTool',
    description: 'Busca e retorna uma lista de lojas que vendem um produto específico. Se a latitude e longitude do usuário forem fornecidas, pode usá-las para priorizar lojas próximas. Use esta ferramenta quando o usuário perguntar onde comprar um produto.',
    inputSchema: _FindStoresToolInputSchema,
    outputSchema: _FindStoresToolOutputSchema,
  },
  async ({ productName, latitude, longitude }) => {
    // Implementação simulada (mock)
    // No futuro, isso poderia consultar um banco de dados ou uma API externa.
    console.log(`[findStoresTool] Buscando lojas para: ${productName}`);
    if (latitude && longitude) {
      console.log(`[findStoresTool] Localização do usuário fornecida: Lat ${latitude}, Lng ${longitude}`);
      // Aqui, no futuro, a lógica de busca usaria essas coordenadas.
      // Por exemplo, poderia filtrar lojas em um raio de X km, ou ordenar pela distância.
    } else {
      console.log('[findStoresTool] Localização do usuário não fornecida.');
    }
    
    let mockStores: string[] = [];

    const lowerProductName = productName.toLowerCase();

    if (lowerProductName.includes('coca-cola')) {
      mockStores = ['Supermercado Central', 'Loja da Esquina', 'Mercado Preço Bom', 'Distribuidora de Bebidas XYZ'];
      if (latitude) mockStores.push('Loja Próxima Fictícia de Bebidas');
    } else if (lowerProductName.includes('sabão em pó') || lowerProductName.includes('detergente')) {
      mockStores = ['Supermercado Central', 'Mercado Preço Bom', 'Atacadão Limpeza'];
    } else if (lowerProductName.includes('notebook') || lowerProductName.includes('laptop') || lowerProductName.includes('smartphone')) {
      mockStores = ['Tech Store XYZ', 'Magazine Luiza', 'Casas Bahia', 'Fast Shop'];
      if (latitude) mockStores.unshift('Tech Perto de Você'); // Adiciona no início se houver localização
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

