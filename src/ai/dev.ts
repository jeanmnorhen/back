
import { config } from 'dotenv';
config();

import '@/ai/flows/identify-objects.ts';
import '@/ai/flows/extract-product-properties.ts';
import '@/ai/flows/search-related-products.ts';
import '@/ai/flows/find-product-stores-flow.ts'; // Novo fluxo adicionado
import '@/ai/flows/super-agent-analytics-chat-flow.ts'; // Novo fluxo para o superagente

    