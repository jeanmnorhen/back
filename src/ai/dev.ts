import { config } from 'dotenv';
config();

import '@/ai/flows/identify-objects.ts';
import '@/ai/flows/extract-product-properties.ts';
import '@/ai/flows/search-related-products.ts';