
'use client';

import { useEffect, useState } from 'react';
import { Database, DollarSign, Globe, Loader2, AlertTriangle, BarChart3, Package } from 'lucide-react';
import { ref, get } from 'firebase/database';
import {useTranslations} from 'next-intl';

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
  productCount: number; 
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
  const t = useTranslations('MonitoringPage');
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
        toast({ title: t('noProductsFoundToastTitle'), description: t('noProductsFoundToastDescription'), variant: 'default' });
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      const errorMessage = err instanceof Error ? err.message : t('loadProductsError');
      setError(errorMessage);
      toast({ title: t('fetchProductsErrorToastTitle'), description: errorMessage, variant: 'destructive' });
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
        toast({ title: t('noPriceDataToastTitle'), description: t('noPriceDataToastDescription'), variant: 'default' });
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
            if (countryPrices[country].currency === null) {
                countryPrices[country].currency = currency;
            } else if (countryPrices[country].currency !== currency) {
                console.warn(`Moedas mistas encontradas para o país ${country}. Usando ${countryPrices[country].currency}.`);
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
          toast({title: t('insufficientDataToastTitle'), description: t('insufficientDataToastDescription'), variant: "default"});
      }

    } catch (err) {
      console.error('Erro ao buscar dados de preço:', err);
      const errorMessage = err instanceof Error ? err.message : t('loadPriceDataError');
      setError(errorMessage);
      toast({ title: t('fetchPriceDataErrorToastTitle'), description: errorMessage, variant: 'destructive' });
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
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Package className="w-7 h-7 text-primary" />
              {t('selectProductCardTitle')}
            </CardTitle>
            <CardDescription>{t('selectProductCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('loadingProducts')}
              </div>
            ) : products.length > 0 ? (
              <Select onValueChange={handleProductChange} disabled={isLoadingPriceData}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder={t('selectProductPlaceholder')} />
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
                 <p className="text-muted-foreground">{t('noProductsAvailable')}</p>
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
                {t('averagePriceCardTitle')}
              </CardTitle>
              <CardDescription>
                {t('averagePriceCardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPriceData ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('loadingPriceData')}
                </div>
              ) : priceData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">{t('countryCodeTableHeader')}</TableHead>
                      <TableHead>{t('averagePriceTableHeader')}</TableHead>
                      <TableHead>{t('currencyTableHeader')}</TableHead>
                      <TableHead className="text-right">{t('recordsTableHeader')}</TableHead>
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
                  {t('noAggregatedPriceData')}
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
        <p>{t('footerText', {year: new Date().getFullYear()})}</p>
      </footer>
    </div>
  );
}
