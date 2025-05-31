
'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { UploadCloud, Image as ImageIcon, Loader2, AlertTriangle, Wand2, ScanSearch, ShoppingBag, Tags, PackageSearch, Languages, Store, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// AI Flow imports
import { identifyObjects, type IdentifyObjectsOutput, type TranslatedObjectType } from '@/ai/flows/identify-objects';
import { searchRelatedProducts, type SearchRelatedProductsOutput } from '@/ai/flows/search-related-products';
import { extractProductProperties, type ExtractProductPropertiesOutput } from '@/ai/flows/extract-product-properties';
import { findProductStores, type FindProductStoresInput, type FindProductStoresOutput } from '@/ai/flows/find-product-stores-flow';


type ProductSearchResultItem = {
  objectName: string;
  relatedProducts: string[];
};

type StoreSearchResults = {
  [productName: string]: {
    isLoading: boolean;
    stores: string[] | null;
    error?: string | null;
  }
}

type UserLocation = {
  latitude: number;
  longitude: number;
};

type AnalysisResults = {
  objects: TranslatedObjectType[] | null;
  relatedProducts: SearchRelatedProductsOutput['searchResults'] | null;
  productProperties: ExtractProductPropertiesOutput | null;
  storeSearch: StoreSearchResults;
};

const initialResultsState: AnalysisResults = {
  objects: null,
  relatedProducts: null,
  productProperties: null,
  storeSearch: {},
};

const languageMap: Record<string, string> = {
  es: 'Espanhol',
  fr: 'Francês',
  de: 'Alemão',
  zh: 'Chinês (Simplificado)',
  ja: 'Japonês',
  pt_BR: 'Português (Brasil)',
  pt_PT: 'Português (Portugal)',
};

export default function ImageInsightExplorerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults>(initialResultsState);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResults(initialResultsState);
    setSelectedFile(null);
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Arquivo muito grande. O tamanho máximo é 5MB.');
        toast({ title: 'Erro', description: 'Arquivo muito grande. O tamanho máximo é 5MB.', variant: 'destructive' });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Tipo de arquivo inválido. Por favor, envie uma imagem.');
        toast({ title: 'Erro', description: 'Tipo de arquivo inválido. Por favor, envie uma imagem.', variant: 'destructive' });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
        setSelectedFile(null);
        setPreviewUrl(null);
    }
  };

  const processImage = async (imageDataUri: string) => {
    setIsLoading(true);
    setError(null);
    setResults(initialResultsState);
    setProgressValue(0);

    try {
      setCurrentStep('Identificando & traduzindo objetos...');
      setProgressValue(25);
      const objectsAndTranslationsResult: IdentifyObjectsOutput = await identifyObjects({ photoDataUri: imageDataUri });
      
      if (!objectsAndTranslationsResult || !objectsAndTranslationsResult.identifiedItems || objectsAndTranslationsResult.identifiedItems.length === 0) {
        toast({ title: 'Análise Concluída', description: 'Nenhum objeto identificado na imagem.', variant: 'default' });
        setResults(prev => ({ ...prev, objects: [] }));
        setProgressValue(100);
        setIsLoading(false);
        setCurrentStep(null);
        return;
      }
      setResults(prev => ({ ...prev, objects: objectsAndTranslationsResult.identifiedItems }));
      toast({ title: 'Etapa Concluída', description: 'Objetos identificados e traduzidos com sucesso!', variant: 'default' });
      setProgressValue(50);

      const englishObjectNames = objectsAndTranslationsResult.identifiedItems.map(item => item.original);

      setCurrentStep('Buscando produtos relacionados...');
      const relatedProductsResult = await searchRelatedProducts({ objects: englishObjectNames });
       if (!relatedProductsResult || !relatedProductsResult.searchResults || relatedProductsResult.searchResults.length === 0) {
          toast({ title: 'Etapa Concluída', description: 'Nenhum produto relacionado encontrado para os objetos.', variant: 'default' });
          setResults(prev => ({...prev, relatedProducts: []}))
      } else {
        setResults(prev => ({ ...prev, relatedProducts: relatedProductsResult.searchResults }));
        toast({ title: 'Etapa Concluída', description: 'Produtos relacionados encontrados!', variant: 'default' });
      }
      setProgressValue(75);
      
      const allProducts: string[] = [];
      if (relatedProductsResult && relatedProductsResult.searchResults) {
        relatedProductsResult.searchResults.forEach(item => {
          item.relatedProducts.forEach(product => {
            if (!allProducts.includes(product)) {
              allProducts.push(product);
            }
          });
        });
      }
      
      if (allProducts.length > 0) {
        setCurrentStep('Extraindo propriedades dos produtos...');
        const propertiesResult = await extractProductProperties(allProducts);
        setResults(prev => ({ ...prev, productProperties: propertiesResult }));
        toast({ title: 'Análise Concluída', description: 'Propriedades dos produtos extraídas!', variant: 'default' });
      } else {
         toast({ title: 'Atualização da Análise', description: 'Nenhum produto para extrair propriedades. Etapa de extração de propriedades ignorada.', variant: 'default' });
      }
      setProgressValue(100);

    } catch (err) {
      console.error('Erro durante o processamento da IA:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido durante o processamento da IA.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo de imagem.');
      toast({ title: 'Erro', description: 'Por favor, selecione um arquivo de imagem.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result as string;
      processImage(imageDataUri);
    };
    reader.onerror = () => {
      setError('Falha ao ler o arquivo de imagem.');
      toast({ title: 'Erro', description: 'Falha ao ler o arquivo de imagem.', variant: 'destructive' });
    }
    reader.readAsDataURL(selectedFile);
  };

  const handleFindStores = async (productName: string) => {
    setResults(prev => ({
      ...prev,
      storeSearch: {
        ...prev.storeSearch,
        [productName]: { isLoading: true, stores: null, error: null }
      }
    }));

    const input: FindProductStoresInput = { 
      productName 
    };
    if (userLocation) {
      input.latitude = userLocation.latitude;
      input.longitude = userLocation.longitude;
    }

    try {
      const storeResults: FindProductStoresOutput = await findProductStores(input);
      setResults(prev => ({
        ...prev,
        storeSearch: {
          ...prev.storeSearch,
          [productName]: { isLoading: false, stores: storeResults.foundStores, error: null }
        }
      }));
      if (storeResults.foundStores.length > 0) {
        toast({ title: 'Lojas Encontradas', description: `Lojas encontradas para ${productName}.`, variant: 'default' });
      } else {
        toast({ title: 'Nenhuma Loja Encontrada', description: `Nenhuma loja encontrada para ${productName}.`, variant: 'default' });
      }
    } catch (err) {
      console.error(`Erro ao encontrar lojas para ${productName}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao encontrar lojas.';
      setResults(prev => ({
        ...prev,
        storeSearch: {
          ...prev.storeSearch,
          [productName]: { isLoading: false, stores: null, error: errorMessage }
        }
      }));
      toast({ title: 'Erro ao Encontrar Lojas', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador.');
      toast({ title: 'Erro de Geolocalização', description: 'Geolocalização não é suportada pelo seu navegador.', variant: 'destructive' });
      return;
    }
    
    setIsRequestingLocation(true);
    setLocationError(null);
    //setUserLocation(null); // Do not clear location if user is re-requesting

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast({ title: 'Localização Obtida', description: 'Sua localização foi obtida com sucesso!', variant: 'default' });
        setIsRequestingLocation(false);
      },
      (error) => {
        let message = 'Não foi possível obter sua localização.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permissão para acessar a localização foi negada.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Informação de localização não está disponível.';
        } else if (error.code === error.TIMEOUT) {
          message = 'A solicitação para obter a localização expirou.';
        }
        setLocationError(message);
        toast({ title: 'Erro de Geolocalização', description: message, variant: 'destructive' });
        setIsRequestingLocation(false);
      }
    );
  };


  const hasResults = (results.objects && results.objects.length > 0) || 
                     (results.relatedProducts && results.relatedProducts.length > 0) || 
                     results.productProperties;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 selection:bg-primary/20">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
         <Wand2 className="w-10 h-10 text-primary" />
         <h1 className="text-4xl font-bold sm:text-5xl tracking-tight bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            Image Insight Explorer
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Envie uma imagem para identificar objetos, ver traduções e descobrir produtos e lojas relacionadas.
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UploadCloud className="w-7 h-7 text-primary" />
              Envie Sua Imagem
            </CardTitle>
            <CardDescription>Selecione um arquivo de imagem (PNG, JPG, GIF, etc.) de até 5MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="image-upload" className="sr-only">Escolher imagem</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file:text-primary file:font-semibold hover:file:bg-primary/10"
                  disabled={isLoading || isRequestingLocation}
                />
              </div>
              {previewUrl && (
                <div className="mt-4 border rounded-lg p-2 bg-muted/50 overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                  <NextImage
                    src={previewUrl}
                    alt="Pré-visualização da imagem selecionada"
                    layout="fill"
                    objectFit="contain"
                    className="rounded"
                    data-ai-hint="uploaded image"
                  />
                </div>
              )}
              {error && !isLoading && (
                 <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {error}</p>
              )}
              <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !selectedFile || isRequestingLocation}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Analisar Imagem
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          {isLoading && currentStep && (
            <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                <Progress value={progressValue} className="w-full h-2" />
                <p className="text-sm text-muted-foreground">{currentStep} ({progressValue}%)</p>
            </CardFooter>
          )}
        </Card>

        {!userLocation && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-6 h-6 text-primary" />
                Sua Localização
              </CardTitle>
              <CardDescription>Permita o acesso à sua localização para otimizar buscas futuras por lojas (opcional).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRequestLocation} 
                disabled={isRequestingLocation || isLoading}
                variant="outline"
              >
                {isRequestingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Obtendo Localização...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Obter Minha Localização Atual
                  </>
                )}
              </Button>
              {/* {userLocation && ( // This part is now implicitly handled by the parent conditional rendering
                <div className="text-sm p-3 bg-muted/50 rounded-md">
                  <p className="font-medium">Localização Obtida:</p>
                  <p>Latitude: <span className="font-semibold">{userLocation.latitude.toFixed(5)}</span></p>
                  <p>Longitude: <span className="font-semibold">{userLocation.longitude.toFixed(5)}</span></p>
                </div>
              )} */}
              {locationError && (
                <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {locationError}</p>
              )}
            </CardContent>
          </Card>
        )}
         {userLocation && ( // Display confirmation if location is already set and card is hidden
            <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Sua localização foi obtida: Lat {userLocation.latitude.toFixed(4)}, Lng {userLocation.longitude.toFixed(4)}.</span>
            </div>
        )}


        {hasResults && !isLoading && (
          <div className="space-y-8">
            <Separator />
            <h2 className="text-3xl font-semibold text-center text-primary">Resultados da Análise</h2>
            
            {results.objects && results.objects.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ScanSearch className="w-6 h-6 text-primary" />
                    Objetos Identificados & Traduções
                  </CardTitle>
                  <CardDescription>Objetos encontrados na imagem com suas traduções.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {results.objects.map((item, index) => (
                      <AccordionItem key={`${item.original}-${index}`} value={`${item.original}-${index}`}>
                        <AccordionTrigger className="text-base font-medium hover:text-primary">
                           <div className="flex items-center gap-2">
                                <Languages className="w-5 h-5 text-muted-foreground"/>
                                Original: <span className="font-semibold text-foreground">{item.original}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {Object.entries(item.translations).filter(([, translation]) => translation !== undefined).length > 0 ? (
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                              {Object.entries(item.translations).map(([langCode, translation]) => 
                                translation && languageMap[langCode] && (
                                  <li key={langCode}>
                                    <span className="font-medium text-foreground">{languageMap[langCode]}:</span> {translation}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Nenhuma tradução disponível para {item.original}.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
             {results.objects && results.objects.length === 0 && selectedFile && !error && (
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ScanSearch className="w-6 h-6 text-primary" />
                            Objetos Identificados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Nenhum objeto foi claramente identificado na imagem.</p>
                    </CardContent>
                 </Card>
            )}


            {results.relatedProducts && results.relatedProducts.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    Produtos Relacionados
                  </CardTitle>
                  <CardDescription>Produtos encontrados relacionados aos objetos identificados (baseado nos nomes originais).</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {results.relatedProducts.map((item) => (
                      item.relatedProducts.length > 0 && (
                        <AccordionItem key={item.objectName} value={`related-${item.objectName}`}>
                            <AccordionTrigger className="text-base font-medium hover:text-primary">
                                <div className="flex items-center gap-2">
                                    <PackageSearch className="w-5 h-5 text-muted-foreground"/>
                                    Produtos para: <span className="font-semibold text-foreground">{item.objectName}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                            {item.relatedProducts.length > 0 ? (
                                <ul className="space-y-3">
                                {item.relatedProducts.map((product, index) => (
                                    <li key={index} className="p-3 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-foreground">{product}</span>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleFindStores(product)}
                                                disabled={results.storeSearch[product]?.isLoading || isLoading || isRequestingLocation}
                                            >
                                                {results.storeSearch[product]?.isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Store className="w-4 h-4 mr-2" />
                                                )}
                                                Encontrar Lojas
                                                {userLocation && <MapPin className="w-3 h-3 ml-1 text-primary" />}
                                            </Button>
                                        </div>
                                        {results.storeSearch[product]?.isLoading && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Buscando lojas...
                                            </p>
                                        )}
                                        {results.storeSearch[product]?.error && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {results.storeSearch[product]?.error}
                                            </p>
                                        )}
                                        {results.storeSearch[product]?.stores && results.storeSearch[product]?.stores!.length === 0 && !results.storeSearch[product]?.isLoading && (
                                            <p className="text-sm text-muted-foreground italic">Nenhuma loja encontrada para {product}.</p>
                                        )}
                                        {results.storeSearch[product]?.stores && results.storeSearch[product]?.stores!.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Disponível em:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {results.storeSearch[product]?.stores!.map((storeName, storeIdx) => (
                                                        <Badge key={storeIdx} variant="secondary" className="flex items-center gap-1">
                                                            <Store className="w-3 h-3"/> {storeName}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhum produto específico encontrado para {item.objectName}.</p>
                            )}
                            </AccordionContent>
                        </AccordionItem>
                      )
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {results.productProperties && results.productProperties.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Tags className="w-6 h-6 text-primary" />
                    Propriedades dos Produtos
                  </CardTitle>
                  <CardDescription>Principais propriedades extraídas para os produtos identificados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {results.productProperties.map((productItem) => (
                      productItem.properties.length > 0 && (
                        <AccordionItem key={productItem.product} value={`prop-${productItem.product}`}>
                            <AccordionTrigger className="text-base font-medium hover:text-primary">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-muted-foreground"/>
                                    Propriedades para: <span className="font-semibold text-foreground">{productItem.product}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                            {productItem.properties.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                {productItem.properties.map((property, index) => (
                                    <Badge key={index} variant="outline" className="text-sm">{property}</Badge>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhuma propriedade específica encontrada para {productItem.product}.</p>
                            )}
                            </AccordionContent>
                        </AccordionItem>
                      )
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {!isLoading && !hasResults && selectedFile && !error && !(results.objects && results.objects.length === 0) && (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">Análise Completa</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A imagem foi processada, mas nenhum detalhe adicional pôde ser extraído. Você pode tentar com uma imagem diferente.</p>
                </CardContent>
            </Card>
        )}

      </main>
      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t w-full max-w-4xl">
        <p>&copy; {new Date().getFullYear()} Image Insight Explorer. Desenvolvido com Genkit AI.</p>
        <p>Traduções fornecidas para: Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil), Português (Portugal).</p>
      </footer>
    </div>
  );
}

