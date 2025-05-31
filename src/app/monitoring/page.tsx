
'use client';

import { useEffect, useState } from 'react';
import { Database, DollarSign, Globe, Loader2, AlertTriangle, BarChart3, Package } from 'lucide-react';
import { ref, get } from 'firebase/database';

import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: string;
  name: string;
}

interface ProductPriceByCountry {
  countryCode: string;
  averagePrice: number;
  currency: string;
  productCount: number; // How many price entries contributed to this average
}

interface StoreInfo {
    name: string;
    location?: {
        address?: string;
        city?: string;
        countryCode?: string;
        postalCode?: string;
        coordinates?: { lat: number; lng: number };
    };
    defaultCurrency?: string;
}

interface ProductAvailabilityInfo {
    currentPrice: number;
    currency: string;
    inStock?: boolean;
    productUrl?: string;
    lastSeen?: number;
}


export default function MonitoringPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<ProductPriceByCountry[]>([]);
  
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const productsRef = ref(db, 'products');
      const snapshot = await get(productsRef);
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const fetchedProducts: Product[] = Object.keys(productsData).map((key) => ({
          id: key,
          name: productsData[key].canonicalName || `Produto ${key}`,
        }));
        setProducts(fetchedProducts);
      } else {
        setProducts([]);
        toast({ title: 'Nenhum Produto Encontrado', description: 'Não há produtos no banco de dados para monitorar.', variant: 'default' });
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar produtos.';
      setError(errorMessage);
      toast({ title: 'Erro ao Buscar Produtos', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    if (productId) {
      fetchPriceDataForProduct(productId);
    } else {
      setPriceData([]);
    }
  };

  const fetchPriceDataForProduct = async (productId: string) => {
    setIsLoadingPriceData(true);
    setError(null);
    setPriceData([]);

    try {
      const availabilityRef = ref(db, `productAvailability/${productId}`);
      const availabilitySnapshot = await get(availabilityRef);

      if (!availabilitySnapshot.exists()) {
        setPriceData([]);
        toast({ title: 'Sem Dados de Preço', description: 'Nenhuma informação de preço encontrada para este produto.', variant: 'default' });
        setIsLoadingPriceData(false);
        return;
      }

      const availabilityData = availabilitySnapshot.val() as Record<string, ProductAvailabilityInfo>;
      const storeIds = Object.keys(availabilityData);

      if (storeIds.length === 0) {
        setPriceData([]);
        setIsLoadingPriceData(false);
        return;
      }
      
      const countryPrices: Record<string, { prices: number[]; currency: string | null; count: number }> = {};

      // Fetch all store details in parallel
      const storePromises = storeIds.map(storeId => get(ref(db, `stores/${storeId}`)));
      const storeSnapshots = await Promise.all(storePromises);

      storeSnapshots.forEach((storeSnapshot, index) => {
        const storeId = storeIds[index];
        if (storeSnapshot.exists()) {
          const store = storeSnapshot.val() as StoreInfo;
          const country = store.location?.countryCode;
          const priceInfo = availabilityData[storeId];

          if (country && priceInfo?.currentPrice !== undefined) {
            const currency = priceInfo.currency || store.defaultCurrency || 'N/A';
            if (!countryPrices[country]) {
              countryPrices[country] = { prices: [], currency: null, count: 0 };
            }
            countryPrices[country].prices.push(priceInfo.currentPrice);
            countryPrices[country].count++;
            // For simplicity, use the currency of the first product entry for that country.
            // A more robust solution would handle multiple currencies within a country.
            if (countryPrices[country].currency === null) {
                countryPrices[country].currency = currency;
            } else if (countryPrices[country].currency !== currency) {
                // If currencies are mixed for a country, mark it or pick one.
                // For now, we can note this complexity.
                console.warn(`Moedas mistas encontradas para o país ${country}. Usando ${countryPrices[country].currency}.`);
                // Or append to currency string e.g. countryPrices[country].currency += ` / ${currency}`
            }
          }
        }
      });

      const aggregatedData: ProductPriceByCountry[] = Object.keys(countryPrices).map((countryCode) => {
        const data = countryPrices[countryCode];
        const averagePrice = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
        return {
          countryCode,
          averagePrice: parseFloat(averagePrice.toFixed(2)),
          currency: data.currency || 'N/A',
          productCount: data.count,
        };
      });

      setPriceData(aggregatedData);
      if (aggregatedData.length === 0) {
          toast({title: "Dados Insuficientes", description: "Não foi possível agregar dados de preço por país (verifique se as lojas têm 'countryCode').", variant: "default"});
      }

    } catch (err) {
      console.error('Erro ao buscar dados de preço:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar dados de preço.';
      setError(errorMessage);
      toast({ title: 'Erro ao Buscar Dados de Preço', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoadingPriceData(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 selection:bg-primary/20">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BarChart3 className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold sm:text-5xl tracking-tight bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            Monitoramento de Preços
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Visualize o valor médio de produtos por país.
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Package className="w-7 h-7 text-primary" />
              Selecionar Produto
            </CardTitle>
            <CardDescription>Escolha um produto para ver seus dados de preço por país.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando produtos...
              </div>
            ) : products.length > 0 ? (
              <Select onValueChange={handleProductChange} disabled={isLoadingPriceData}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
                 <p className="text-muted-foreground">Nenhum produto disponível para seleção.</p>
            )}
             {error && !isLoadingProducts && (
                 <p className="text-sm text-destructive flex items-center gap-2 mt-2"><AlertTriangle className="w-4 h-4"/> {error}</p>
            )}
          </CardContent>
        </Card>

        {selectedProductId && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe className="w-6 h-6 text-primary" />
                Preço Médio por País
              </CardTitle>
              <CardDescription>
                Valor médio do produto selecionado nos países onde está disponível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPriceData ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Carregando dados de preço...
                </div>
              ) : priceData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">País (Código)</TableHead>
                      <TableHead>Preço Médio</TableHead>
                      <TableHead>Moeda</TableHead>
                      <TableHead className="text-right">Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceData.map((data) => (
                      <TableRow key={data.countryCode}>
                        <TableCell className="font-medium">{data.countryCode}</TableCell>
                        <TableCell>{data.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>{data.currency}</TableCell>
                        <TableCell className="text-right">{data.productCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  Nenhum dado de preço agregado por país para exibir para o produto selecionado.
                  Verifique se os produtos têm disponibilidade registrada e se as lojas associadas possuem `countryCode`.
                </p>
              )}
              {error && !isLoadingPriceData && (
                 <p className="text-sm text-destructive flex items-center gap-2 mt-2"><AlertTriangle className="w-4 h-4"/> {error}</p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t w-full max-w-4xl">
        <p>&copy; {new Date().getFullYear()} Image Insight Explorer. Painel de Monitoramento.</p>
      </footer>
    </div>
  );
}
