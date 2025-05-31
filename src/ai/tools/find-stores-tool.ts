
/**
 * @fileOverview Ferramenta Genkit para encontrar lojas que vendem um determinado produto, consultando o Firebase Realtime Database.
 *
 * - findStoresTool - A definição da ferramenta Genkit.
 * - FindStoresToolInput - O tipo de entrada para a ferramenta (schema é interno).
 * - FindStoresToolOutput - O tipo de saída para a ferramenta (schema é interno).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase'; // Importar instância do DB
import { ref, get, query, orderByChild, equalTo } from 'firebase/database'; // Importar funções do Firebase

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
    description: 'Busca e retorna uma lista de lojas que vendem um produto específico, consultando um banco de dados. Aceita latitude e longitude do usuário (opcional), que são registradas e podem ser usadas futuramente para priorizar lojas próximas; a busca atual não filtra ou ordena por proximidade. Use esta ferramenta quando o usuário perguntar onde comprar um produto.',
    inputSchema: _FindStoresToolInputSchema,
    outputSchema: _FindStoresToolOutputSchema,
  },
  async ({ productName, latitude, longitude }) => {
    console.log(`[findStoresTool] Buscando lojas para: ${productName} no Firebase.`);
    if (latitude && longitude) {
      console.log(`[findStoresTool] Localização do usuário fornecida: Lat ${latitude}, Lng ${longitude}. Esta informação será usada futuramente para busca por proximidade. A busca atual não utiliza estas coordenadas para filtrar ou ordenar.`);
    } else {
      console.log('[findStoresTool] Localização do usuário não fornecida.');
    }

    const foundStoreNames: string[] = [];

    try {
      // Passo 1: Encontrar o productId com base no productName (buscando pelo canonicalName)
      const productsRef = ref(db, 'products');
      const productsSnapshot = await get(productsRef);
      let targetProductId: string | null = null;

      if (productsSnapshot.exists()) {
        const productsData = productsSnapshot.val();
        for (const productId in productsData) {
          if (productsData[productId].canonicalName && productsData[productId].canonicalName.toLowerCase() === productName.toLowerCase()) {
            targetProductId = productId;
            break;
          }
        }
      }

      if (!targetProductId) {
        console.log(`[findStoresTool] Produto "${productName}" não encontrado no nó /products pelo canonicalName.`);
        return { stores: [] };
      }
      console.log(`[findStoresTool] Produto ID encontrado para "${productName}": ${targetProductId}`);

      // Passo 2: Consultar /productAvailability/{productId} para obter storeIds
      const productAvailabilityRef = ref(db, `productAvailability/${targetProductId}`);
      const availabilitySnapshot = await get(productAvailabilityRef);

      if (!availabilitySnapshot.exists()) {
        console.log(`[findStoresTool] Nenhuma disponibilidade encontrada para o produto ID: ${targetProductId}`);
        return { stores: [] };
      }

      const availabilityData = availabilitySnapshot.val();
      const storeIds = Object.keys(availabilityData);

      if (storeIds.length === 0) {
        console.log(`[findStoresTool] Nenhuma loja encontrada com disponibilidade para o produto ID: ${targetProductId}`);
        return { stores: [] };
      }

      // Passo 3: Para cada storeId, buscar os detalhes da loja em /stores/{storeId}
      for (const storeId of storeIds) {
        const storeRef = ref(db, `stores/${storeId}`);
        const storeSnapshot = await get(storeRef);
        if (storeSnapshot.exists()) {
          const storeData = storeSnapshot.val();
          if (storeData.name) {
            foundStoreNames.push(storeData.name);
          } else {
            console.warn(`[findStoresTool] Loja com ID ${storeId} não possui um nome.`);
          }
        } else {
          console.warn(`[findStoresTool] Detalhes da loja não encontrados para o ID: ${storeId}`);
        }
      }

      // Futuramente: aqui poderia entrar a lógica de filtragem/ordenação por proximidade
      // usando as coordenadas do usuário e das lojas (se as lojas tiverem coordenadas no DB).

    } catch (error) {
      console.error('[findStoresTool] Erro ao consultar o Firebase:', error);
      // Em caso de erro, retorna uma lista vazia para não quebrar o fluxo.
      return { stores: [] };
    }
    
    console.log(`[findStoresTool] Lojas encontradas para ${productName} via Firebase: ${foundStoreNames.join(', ')}`);
    return { stores: foundStoreNames };
  }
);

// Exemplo de como dados poderiam ser estruturados no Firebase para teste:
/*
{
  "products": {
    "coke2l": {
      "canonicalName": "Coca-Cola 2 Liter Bottle",
      "brand": "Coca-Cola",
      // ... outros dados do produto
    },
    "pepsi1l": {
      "canonicalName": "Pepsi 1 Liter Bottle",
      "brand": "Pepsi"
    }
  },
  "stores": {
    "storeABC": {
      "name": "Supermercado Central",
      "location": { "city": "Cidade Exemplo" }
      // ... outros dados da loja
    },
    "storeXYZ": {
      "name": "Mercado Preço Bom",
      "location": { "city": "Outra Cidade" }
    }
  },
  "productAvailability": {
    "coke2l": { // productId
      "storeABC": { // storeId
        "currentPrice": 7.99,
        "inStock": true
      },
      "storeXYZ": {
        "currentPrice": 7.85,
        "inStock": true
      }
    },
    "pepsi1l": {
      "storeABC": {
        "currentPrice": 5.50,
        "inStock": false
      }
    }
  }
}
*/
