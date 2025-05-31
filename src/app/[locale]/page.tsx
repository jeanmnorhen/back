
'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Loader2, 
  AlertTriangle, 
  Wand2, 
  ScanSearch, 
  ShoppingBag, 
  Tags, 
  PackageSearch, 
  Languages, 
  Store, 
  MapPin,
  Search,
  Utensils,
  Pizza,
  Beer,
  ShoppingCart,
  BadgePercent,
  Clock,
  Camera as CameraIcon, // Renomeado para CameraIcon para evitar conflito
  Video,
  CircleX,
  CameraOff
} from 'lucide-react';
import {useTranslations} from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


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

interface Deal {
  id: string;
  productName: string;
  price: string;
  storeName: string;
  distance: string;
  imageUrl: string;
  dataAiHint: string;
  expiresIn: string;
  category?: string; // For filtering
}

// Mock Data for Deals Feed - will be replaced by Firebase data
const mockDeals: Deal[] = [
  { id: '1', productName: 'Super Hamburguer X', price: 'R$ 29,99', storeName: 'Lanchonete do Zé', distance: '500m', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'hamburger burger', expiresIn: '23h restantes', category: 'Lanches' },
  { id: '2', productName: 'Pizza Grande Calabresa', price: 'R$ 45,00', storeName: 'Pizzaria da Esquina', distance: '1.2km', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'pizza food', expiresIn: '12h restantes', category: 'Pizzas' },
  { id: '3', productName: 'Refrigerante Coca-Cola 2L', price: 'R$ 8,50', storeName: 'Mercadinho Central', distance: '300m', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'soda drink', expiresIn: '48h restantes', category: 'Bebidas' },
  { id: '4', productName: 'Pão Francês (unidade)', price: 'R$ 0,75', storeName: 'Padaria Pão Quente', distance: '800m', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'bread bakery', expiresIn: '5h restantes', category: 'Mercado' },
  { id: '5', productName: 'Hot Dog Especial da Casa', price: 'R$ 15,00', storeName: 'Dogão do Bairro', distance: '250m', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'hotdog snack', expiresIn: '8h restantes', category: 'Lanches' },
];


export default function PrecoRealPage() {
  const t = useTranslations('ImageInsightExplorerPage'); 
  const tLang = useTranslations('Languages');

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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedDeals, setDisplayedDeals] = useState<Deal[]>(mockDeals);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);


  const { toast } = useToast();

  useEffect(() => {
    // Filter deals based on search term and category
    let filtered = mockDeals;
    if (selectedCategory) {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.storeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayedDeals(filtered);
  }, [searchTerm, selectedCategory]);


  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (capturedImagePreview) {
        URL.revokeObjectURL(capturedImagePreview);
      }
      // Stop camera stream if active
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewUrl, capturedImagePreview]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResults(initialResultsState);
    setSelectedFile(null);
    setCapturedImagePreview(null); 
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    }

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        const err = t('fileSizeError');
        setError(err);
        toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        const err = t('fileTypeError');
        setError(err);
        toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCameraStream(); // Stop camera if user uploads a file
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
      setCurrentStep(t('stepIdentifyingObjects'));
      setProgressValue(25);
      const objectsAndTranslationsResult: IdentifyObjectsOutput = await identifyObjects({ photoDataUri: imageDataUri });
      
      if (!objectsAndTranslationsResult || !objectsAndTranslationsResult.identifiedItems || objectsAndTranslationsResult.identifiedItems.length === 0) {
        toast({ title: t('stepCompletedToastTitle'), description: t('noObjectsIdentifiedToastDescription'), variant: 'default' });
        setResults(prev => ({ ...prev, objects: [] }));
        setProgressValue(100);
        setIsLoading(false);
        setCurrentStep(null);
        return;
      }
      setResults(prev => ({ ...prev, objects: objectsAndTranslationsResult.identifiedItems }));
      toast({ title: t('stepCompletedToastTitle'), description: t('identifiedObjectsToastDescription'), variant: 'default' });
      setProgressValue(50);

      const englishObjectNames = objectsAndTranslationsResult.identifiedItems.map(item => item.original);

      setCurrentStep(t('stepSearchingProducts'));
      const relatedProductsResult = await searchRelatedProducts({ objects: englishObjectNames });
       if (!relatedProductsResult || !relatedProductsResult.searchResults || relatedProductsResult.searchResults.length === 0) {
          toast({ title: t('stepCompletedToastTitle'), description: t('noRelatedProductsToastDescription'), variant: 'default' });
          setResults(prev => ({...prev, relatedProducts: []}))
      } else {
        setResults(prev => ({ ...prev, relatedProducts: relatedProductsResult.searchResults }));
        toast({ title: t('stepCompletedToastTitle'), description: t('relatedProductsFoundToastDescription'), variant: 'default' });
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
        setCurrentStep(t('stepExtractingProperties'));
        const propertiesResult = await extractProductProperties(allProducts);
        setResults(prev => ({ ...prev, productProperties: propertiesResult }));
        toast({ title: t('analysisCompleteToastTitle'), description: t('propertiesExtractedToastDescription'), variant: 'default' });
      } else {
         toast({ title: t('analysisCompleteToastTitle'), description: t('noProductsToExtractPropertiesToastDescription'), variant: 'default' });
      }
      setProgressValue(100);

    } catch (err) {
      console.error('Erro durante o processamento da IA:', err);
      const errorMessage = err instanceof Error ? err.message : t('errorToastTitle');
      setError(errorMessage);
      toast({ title: t('errorToastTitle'), description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const handleSubmitImageAnalysis = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      const err = t('selectImageError');
      setError(err);
      toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result as string;
      processImage(imageDataUri);
    };
    reader.onerror = () => {
      const err = t('imageReadError');
      setError(err);
      toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
    }
    reader.readAsDataURL(selectedFile);
  };

  const handleFindStoresForAnalyzedProduct = async (productName: string) => {
    setResults(prev => ({
      ...prev,
      storeSearch: {
        ...prev.storeSearch,
        [productName]: { isLoading: true, stores: null, error: null }
      }
    }));

    const input: FindProductStoresInput = { productName };
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
        toast({ title: t('storesFoundToastTitle'), description: t('storesFoundToastDescription', {productName}), variant: 'default' });
      } else {
        toast({ title: t('noStoresFoundToastTitle'), description: t('noStoresFoundToastDescription', {productName}), variant: 'default' });
      }
    } catch (err) {
      console.error(`Erro ao encontrar lojas para ${productName}:`, err);
      const errorMessage = err instanceof Error ? err.message : t('findStoresErrorToastTitle');
      setResults(prev => ({
        ...prev,
        storeSearch: {
          ...prev.storeSearch,
          [productName]: { isLoading: false, stores: null, error: errorMessage }
        }
      }));
      toast({ title: t('findStoresErrorToastTitle'), description: errorMessage, variant: 'destructive' });
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      const err = t('locationErrorToastTitle'); 
      setLocationError(err);
      toast({ title: t('locationErrorToastTitle'), description: 'Geolocalização não é suportada pelo seu navegador.', variant: 'destructive' });
      return;
    }
    
    setIsRequestingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast({ title: t('locationAcquiredToast'), variant: 'default' });
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
        toast({ title: t('locationErrorToastTitle'), description: message, variant: 'destructive' });
        setIsRequestingLocation(false);
      }
    );
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleToggleCamera = async () => {
    if (isCameraActive) {
      stopCameraStream();
      setHasCameraPermission(null); // Reset permission state if user explicitly stops
      return;
    }

    setCapturedImagePreview(null); // Clear any captured image
    setSelectedFile(null); // Clear any selected file
    setPreviewUrl(null); // Clear file preview
    setError(null);
    setResults(initialResultsState);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: t('cameraAccessErrorTitle'),
        description: t('cameraGenericError'),
      });
      setHasCameraPermission(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      setIsCameraActive(false);
      toast({
        variant: 'destructive',
        title: t('cameraAccessErrorTitle'),
        description: t('cameraAccessErrorMessage'),
      });
    }
  };

  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImagePreview(dataUri);
        processImage(dataUri); // Process the captured image
      }
      stopCameraStream(); // Stop camera after taking picture
    }
  };


  const hasImageAnalysisResults = (results.objects && results.objects.length > 0) || 
                                 (results.relatedProducts && results.relatedProducts.length > 0) || 
                                 results.productProperties;

  const categories = [
    { name: t('categorySnacks'), icon: Utensils, value: 'Lanches' },
    { name: t('categoryPizzas'), icon: Pizza, value: 'Pizzas' },
    { name: t('categoryDrinks'), icon: Beer, value: 'Bebidas' },
    { name: t('categoryGrocery'), icon: ShoppingCart, value: 'Mercado' },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 selection:bg-primary/20">
      <header className="mb-10 text-center w-full max-w-5xl">
        <div className="flex items-center justify-center gap-3 mb-2">
         <BadgePercent className="w-10 h-10 text-primary" />
         <h1 className="text-4xl font-bold sm:text-5xl tracking-tight bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
        <div className="mt-6 flex justify-center">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        {/* Location Card */}
        {!userLocation && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-6 h-6 text-primary" />
                {t('locationCardTitle')}
              </CardTitle>
              <CardDescription>{t('locationCardDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRequestLocation} 
                disabled={isRequestingLocation || isLoading}
                variant="outline"
              >
                {isRequestingLocation ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('gettingLocationButton')}</>
                ) : (
                  <><MapPin className="w-4 h-4 mr-2" />{t('getLocationButton')}</>
                )}
              </Button>
              {locationError && (
                <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {locationError}</p>
              )}
            </CardContent>
          </Card>
        )}
         {userLocation && ( 
            <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{t('locationAcquiredCard', {latitude: userLocation.latitude.toFixed(4), longitude: userLocation.longitude.toFixed(4)})}</span>
            </div>
        )}
        <Separator />

        {/* Search and Filters Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="w-7 h-7 text-primary" />
              {t('searchSectionTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base"
            />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('categoryFiltersTitle')}</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={selectedCategory === null ? "default": "outline"}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  Todos
                </Button>
                {categories.map(cat => (
                  <Button 
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.value)}
                    size="sm"
                  >
                    <cat.icon className="w-4 h-4 mr-2" />
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Feed Section */}
        <section>
          <h2 className="text-3xl font-semibold text-primary mb-6 flex items-center gap-2">
            <BadgePercent className="w-8 h-8"/>
            {t('dealsFeedTitle')}
          </h2>
          {displayedDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDeals.map(deal => (
                <Card key={deal.id} className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="aspect-video w-full relative overflow-hidden rounded-t-lg">
                    <NextImage 
                        src={deal.imageUrl} 
                        alt={deal.productName} 
                        layout="fill" 
                        objectFit="cover"
                        data-ai-hint={deal.dataAiHint}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{deal.productName}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-2xl font-bold text-primary">{deal.price}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="flex items-center gap-1"><Store className="w-4 h-4"/> {t('dealCardStoreLabel')}: <span className="font-medium text-foreground">{deal.storeName}</span></p>
                      {userLocation && <p className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {t('dealCardDistanceLabel')}: <span className="font-medium text-foreground">{deal.distance}</span></p>}
                      <p className="flex items-center gap-1"><Clock className="w-4 h-4"/> {t('dealCardExpiresLabel')}: <span className="font-medium text-foreground">{deal.expiresIn}</span></p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      <ShoppingBag className="w-4 h-4 mr-2"/>
                      {t('viewDealButton')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">{t('noDealsFound')}</p>
              </CardContent>
            </Card>
          )}
        </section>
        
        <Separator />

        {/* Image Analysis Section (Accordion) */}
        <Accordion type="single" collapsible className="w-full" defaultValue="image-analysis-tool">
            <AccordionItem value="image-analysis-tool">
                <AccordionTrigger className="text-2xl font-semibold hover:text-primary py-4">
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-7 h-7 text-primary" />
                        {t('uploadCardTitle')}
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Card className="shadow-lg border-none">
                        <CardHeader>
                            <CardDescription>{t('uploadCardDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmitImageAnalysis} className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <div className="flex-grow w-full">
                                        <Label htmlFor="image-upload" className="sr-only">{t('analyzeButton')}</Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
                                            disabled={isLoading || isRequestingLocation || isCameraActive}
                                        />
                                    </div>
                                     <Button 
                                        type="button"
                                        onClick={handleToggleCamera} 
                                        variant="outline" 
                                        className="w-full sm:w-auto" 
                                        disabled={isLoading || isRequestingLocation}
                                    >
                                        {isCameraActive ? <CircleX className="mr-2 h-4 w-4" /> : <CameraIcon className="mr-2 h-4 w-4" />}
                                        {isCameraActive ? t('stopCameraButton') : t('useCameraButton')}
                                    </Button>
                                </div>
                                {previewUrl && !isCameraActive && (
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
                                {selectedFile && !isCameraActive && (
                                     <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !selectedFile || isRequestingLocation}>
                                        {isLoading && currentStep && !isCameraActive ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('processingButton')}
                                        </>
                                        ) : (
                                        <>
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            {t('analyzeButton')}
                                        </>
                                        )}
                                    </Button>
                                )}
                                {error && !isLoading && (
                                    <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {error}</p>
                                )}
                            </form>

                            {isCameraActive && hasCameraPermission === true && (
                                <div className="space-y-4 mt-4">
                                    <h3 className="text-lg font-medium flex items-center gap-2"><Video className="w-5 h-5 text-primary"/> {t('cameraPreviewTitle')}</h3>
                                    <div className="border rounded-lg overflow-hidden aspect-video relative w-full max-w-md mx-auto bg-muted">
                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                    </div>
                                    <Button onClick={handleTakePicture} className="w-full sm:w-auto" disabled={isLoading}>
                                        <CameraIcon className="w-4 h-4 mr-2" />
                                        {t('takePictureButton')}
                                    </Button>
                                </div>
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas> 

                            {hasCameraPermission === false && (
                                 <Alert variant="destructive" className="mt-4">
                                    <CameraOff className="h-4 w-4" />
                                    <AlertTitle>{t('alertCameraAccessRequiredTitle')}</AlertTitle>
                                    <AlertDescription>
                                        {t('alertCameraAccessRequiredDescription')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {capturedImagePreview && (
                                <div className="space-y-2 mt-4">
                                     <h3 className="text-lg font-medium flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary"/> {t('capturedImagePreviewTitle')}</h3>
                                    <div className="border rounded-lg p-2 bg-muted/50 overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                                        <NextImage
                                            src={capturedImagePreview}
                                            alt="Imagem capturada pela câmera"
                                            layout="fill"
                                            objectFit="contain"
                                            className="rounded"
                                            data-ai-hint="captured camera image"
                                        />
                                    </div>
                                </div>
                            )}

                        </CardContent>
                        {isLoading && currentStep && (
                            <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                                <Progress value={progressValue} className="w-full h-2" />
                                <p className="text-sm text-muted-foreground">{t('progressMessage', {step: currentStep, progressValue})}</p>
                            </CardFooter>
                        )}
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>


        {hasImageAnalysisResults && !isLoading && (
          <div className="space-y-8 mt-8">
            <h2 className="text-3xl font-semibold text-center text-primary">{t('resultsTitle')}</h2>
            
            {results.objects && results.objects.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ScanSearch className="w-6 h-6 text-primary" />
                    {t('identifiedObjectsCardTitle')}
                  </CardTitle>
                  <CardDescription>{t('identifiedObjectsCardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {results.objects.map((item, index) => (
                      <AccordionItem key={`${item.original}-${index}`} value={`${item.original}-${index}`}>
                        <AccordionTrigger className="text-base font-medium hover:text-primary">
                           <div className="flex items-center gap-2">
                                <Languages className="w-5 h-5 text-muted-foreground"/>
                                {t('objectOriginalLabel')}: <span className="font-semibold text-foreground">{item.original}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {Object.entries(item.translations).filter(([, translation]) => translation !== undefined).length > 0 ? (
                            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                              {Object.entries(item.translations).map(([langCode, translation]) => 
                                translation && tLang.rich(langCode as any) && ( 
                                  <li key={langCode}>
                                    <span className="font-medium text-foreground">{tLang(langCode as any)}:</span> {translation}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">{t('noTranslationsAvailable', {objectName: item.original})}</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
             {results.objects && results.objects.length === 0 && (selectedFile || capturedImagePreview) && !error && (
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ScanSearch className="w-6 h-6 text-primary" />
                            {t('identifiedObjectsCardTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('noObjectsIdentifiedToastDescription')}</p>
                    </CardContent>
                 </Card>
            )}

            {results.relatedProducts && results.relatedProducts.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    {t('relatedProductsCardTitle')}
                  </CardTitle>
                  <CardDescription>{t('relatedProductsCardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {results.relatedProducts.map((item) => (
                      item.relatedProducts.length > 0 && (
                        <AccordionItem key={item.objectName} value={`related-${item.objectName}`}>
                            <AccordionTrigger className="text-base font-medium hover:text-primary">
                                <div className="flex items-center gap-2">
                                    <PackageSearch className="w-5 h-5 text-muted-foreground"/>
                                    {t('relatedProductsForLabel', {objectName: item.objectName})}
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
                                                onClick={() => handleFindStoresForAnalyzedProduct(product)}
                                                disabled={results.storeSearch[product]?.isLoading || isLoading || isRequestingLocation}
                                            >
                                                {results.storeSearch[product]?.isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Store className="w-4 h-4 mr-2" />
                                                )}
                                                {t('findStoresButton')}
                                                {userLocation && <MapPin className="w-3 h-3 ml-1 text-primary" />}
                                            </Button>
                                        </div>
                                        {results.storeSearch[product]?.isLoading && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" /> {t('findingStoresButton')}
                                            </p>
                                        )}
                                        {results.storeSearch[product]?.error && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {results.storeSearch[product]?.error}
                                            </p>
                                        )}
                                        {results.storeSearch[product]?.stores && results.storeSearch[product]?.stores!.length === 0 && !results.storeSearch[product]?.isLoading && (
                                            <p className="text-sm text-muted-foreground italic">{t('noStoresFoundForProduct', {productName: product})}</p>
                                        )}
                                        {results.storeSearch[product]?.stores && results.storeSearch[product]?.stores!.length > 0 && (
                                            <div className="mt-2">
                                                <h4 className="text-xs font-semibold text-muted-foreground mb-1">{t('availableInLabel')}</h4>
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
                                <p className="text-sm text-muted-foreground italic">{t('noRelatedProductsToastDescription')}</p> 
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
                    {t('productPropertiesCardTitle')}
                  </CardTitle>
                  <CardDescription>{t('productPropertiesCardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {results.productProperties.map((productItem) => (
                      productItem.properties.length > 0 && (
                        <AccordionItem key={productItem.product} value={`prop-${productItem.product}`}>
                            <AccordionTrigger className="text-base font-medium hover:text-primary">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-muted-foreground"/>
                                    {t('propertiesForLabel', {productName: productItem.product})}
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
                                <p className="text-sm text-muted-foreground italic">{t('noPropertiesFound', {productName: productItem.product})}</p>
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
        
        {!isLoading && !hasImageAnalysisResults && (selectedFile || capturedImagePreview) && !error && !(results.objects && results.objects.length === 0) && (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">{t('analysisCompleteToastTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t('analysisCompleteNoDetails')}</p>
                </CardContent>
            </Card>
        )}
      </main>
      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t w-full max-w-5xl">
        <p>{t('footerText', {year: new Date().getFullYear()})}</p>
      </footer>
    </div>
  );
}

    