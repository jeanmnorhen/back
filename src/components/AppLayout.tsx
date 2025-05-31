
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, ScanSearch, MapPin, UserCircle, Camera, MoreVertical, LogOut, Store, User, ShieldCheck, MessageSquare, BarChartHorizontalBig, Settings, Trash2, Edit3, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AuthNav from '@/components/AuthNav'; // Continuaremos usando AuthNav dentro do Dropdown
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import NextImage from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";


// AI Flow imports
import { identifyObjects, type IdentifyObjectsOutput, type TranslatedObjectType } from '@/ai/flows/identify-objects';
import { searchRelatedProducts, type SearchRelatedProductsOutput } from '@/ai/flows/search-related-products';
import { extractProductProperties, type ExtractProductPropertiesOutput } from '@/ai/flows/extract-product-properties';
import { findProductStores, type FindProductStoresInput, type FindProductStoresOutput } from '@/ai/flows/find-product-stores-flow';

// Firebase
import { db } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get, onValue, off } from 'firebase/database';

// date-fns
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

// Icons for categories
import { Utensils, Pizza as PizzaIcon, Beer, ShoppingCart } from 'lucide-react';
import { calculateDistance } from '@/lib/utils';


type TabName = 'deals' | 'identify' | 'map' | 'account';

interface AppLayoutProps {
  children?: ReactNode; // Tornar children opcional, já que o conteúdo será gerenciado internamente
}

type UserLocation = {
  latitude: number;
  longitude: number;
};

type AnalysisResults = {
  objects: TranslatedObjectType[] | null;
  relatedProducts: SearchRelatedProductsOutput['searchResults'] | null;
  productProperties: ExtractProductPropertiesOutput | null;
  storeSearch: {
    [productName: string]: {
      isLoading: boolean;
      stores: string[] | null;
      error?: string | null;
    }
  };
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
  price: number;
  currency: string;
  storeName: string;
  storeId: string;
  distance?: string;
  imageUrl: string;
  dataAiHint?: string;
  expiresAt: number; // timestamp
  category?: string;
  location?: { lat: number; lng: number };
}

const categoryIcons = {
  Lanches: Utensils,
  Pizzas: PizzaIcon,
  Bebidas: Beer,
  Mercado: ShoppingCart,
  Default: LayoutGrid,
};


export default function AppLayout({ children }: AppLayoutProps) {
  const t = useTranslations('ImageInsightExplorerPage');
  const tAppLayout = useTranslations('AppLayout');
  const tAuth = useTranslations('Auth');
  const tLang = useTranslations('Languages');
  const currentLocale = useTranslations()('Locale'); // 'en' ou 'pt'

  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabName>('deals');

  // Estados para a aba "Identificar"
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>(initialResultsState);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);

  // Estados para a aba "Ofertas"
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [displayedDeals, setDisplayedDeals] = useState<Deal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);


  // ----- Lógica para aba "Ofertas" -----
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const err = t('locationErrorToastTitle'); // Assume this key exists or add it
      setLocationError(err);
      toast({ title: t('locationErrorToastTitle'), description: 'Geolocalização não é suportada.', variant: 'destructive' });
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
        // Simplified error handling
        setLocationError(t('locationErrorToastTitle'));
        toast({ title: t('locationErrorToastTitle'), description: error.message, variant: 'destructive' });
        setIsRequestingLocation(false);
      }
    );
  }, [t, toast]);

  useEffect(() => {
    if (activeTab === 'deals' && !userLocation && !isRequestingLocation && !locationError) {
      handleRequestLocation();
    }
  }, [activeTab, userLocation, isRequestingLocation, locationError, handleRequestLocation]);


  useEffect(() => {
    setIsLoadingDeals(true);
    const advertisementsRef = query(ref(db, 'advertisements'), orderByChild('status'), equalTo('active'));

    const listener = onValue(advertisementsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const adsData = snapshot.val();
        const activeAdsPromises = Object.keys(adsData).map(async (key) => {
          const ad = adsData[key];
          if (isPast(new Date(ad.expiresAt))) {
            // TODO: Add logic to update status to 'expired' in DB
            return null; 
          }

          let storeName = tAppLayout('unknownStore');
          let storeLocation = ad.location; // Use location from ad if available

          if (ad.storeId) {
            const storeRef = ref(db, `stores/${ad.storeId}`);
            const storeSnapshot = await get(storeRef);
            if (storeSnapshot.exists()) {
              const storeData = storeSnapshot.val();
              storeName = storeData.name || storeName;
              if (storeData.location) { // Prefer store's canonical location
                storeLocation = storeData.location;
              }
            }
          }
          
          return {
            id: key,
            productName: ad.productName,
            price: parseFloat(ad.price),
            currency: ad.currency || 'BRL',
            storeId: ad.storeId,
            storeName: storeName,
            imageUrl: ad.imageUrl || 'https://placehold.co/600x400.png',
            dataAiHint: ad.dataAiHint || 'product offer',
            expiresAt: ad.expiresAt,
            category: ad.category,
            location: storeLocation,
          } as Deal;
        });

        const resolvedDeals = (await Promise.all(activeAdsPromises)).filter(deal => deal !== null) as Deal[];
        setAllDeals(resolvedDeals);
      } else {
        setAllDeals([]);
      }
      setIsLoadingDeals(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      toast({ title: tAppLayout('fetchDealsErrorTitle'), description: error.message, variant: "destructive" });
      setIsLoadingDeals(false);
      setAllDeals([]);
    });

    return () => off(advertisementsRef, 'value', listener);
  }, [tAppLayout, toast]);


  useEffect(() => {
    let filtered = allDeals;

    if (selectedCategory) {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.productName.toLowerCase().includes(lowerSearchTerm) ||
        deal.storeName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Calculate distance and expiresIn for displayed deals
    const processedDeals = filtered.map(deal => {
      let distanceStr;
      if (userLocation && deal.location?.lat && deal.location?.lng) {
        const distKm = calculateDistance(userLocation.latitude, userLocation.longitude, deal.location.lat, deal.location.lng);
        distanceStr = distKm < 1 ? `${(distKm * 1000).toFixed(0)}m` : `${distKm.toFixed(1)}km`;
      }

      const expiresIn = formatDistanceToNowStrict(new Date(deal.expiresAt), {
        addSuffix: true,
        locale: currentLocale === 'pt' ? ptBR : enUS,
      });

      return { ...deal, distance: distanceStr, expiresIn };
    });

    setDisplayedDeals(processedDeals.sort((a,b) => b.expiresAt - a.expiresAt)); // Show newest first, or sort by other criteria
  }, [searchTerm, selectedCategory, allDeals, userLocation, currentLocale]);


  const categories = [
    { name: t('categorySnacks'), icon: Utensils, value: 'Lanches' },
    { name: t('categoryPizzas'), icon: PizzaIcon, value: 'Pizzas' },
    { name: t('categoryDrinks'), icon: Beer, value: 'Bebidas' },
    { name: t('categoryGrocery'), icon: ShoppingCart, value: 'Mercado' },
  ];

  // ----- Lógica para aba "Identificar" -----
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (capturedImagePreview) URL.revokeObjectURL(capturedImagePreview);
      stopCameraStream();
    };
  }, [previewUrl, capturedImagePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageAnalysisError(null);
    setAnalysisResults(initialResultsState);
    setSelectedFile(null);
    setCapturedImagePreview(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        const err = t('fileSizeError');
        setImageAnalysisError(err);
        toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        const err = t('fileTypeError');
        setImageAnalysisError(err);
        toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCameraStream();
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const processImageAnalysis = async (imageDataUri: string) => {
    setIsProcessingImage(true);
    setImageAnalysisError(null);
    setAnalysisResults(initialResultsState);
    setProgressValue(0);

    try {
      setCurrentStep(t('stepIdentifyingObjects'));
      setProgressValue(25);
      const objectsResult = await identifyObjects({ photoDataUri: imageDataUri });
      if (!objectsResult?.identifiedItems?.length) {
        toast({ title: t('stepCompletedToastTitle'), description: t('noObjectsIdentifiedToastDescription'), variant: 'default' });
        setAnalysisResults(prev => ({ ...prev, objects: [] }));
      } else {
        setAnalysisResults(prev => ({ ...prev, objects: objectsResult.identifiedItems }));
        toast({ title: t('stepCompletedToastTitle'), description: t('identifiedObjectsToastDescription'), variant: 'default' });
      }
      setProgressValue(50);

      const englishObjectNames = objectsResult?.identifiedItems?.map(item => item.original) || [];
      if (englishObjectNames.length > 0) {
        setCurrentStep(t('stepSearchingProducts'));
        const relatedProductsResult = await searchRelatedProducts({ objects: englishObjectNames });
        if (!relatedProductsResult?.searchResults?.length) {
          toast({ title: t('stepCompletedToastTitle'), description: t('noRelatedProductsToastDescription'), variant: 'default' });
        } else {
          setAnalysisResults(prev => ({ ...prev, relatedProducts: relatedProductsResult.searchResults }));
          toast({ title: t('stepCompletedToastTitle'), description: t('relatedProductsFoundToastDescription'), variant: 'default' });
        }
        setProgressValue(75);

        const allProducts = relatedProductsResult?.searchResults?.flatMap(item => item.relatedProducts) || [];
        const uniqueProducts = Array.from(new Set(allProducts));

        if (uniqueProducts.length > 0) {
          setCurrentStep(t('stepExtractingProperties'));
          const propertiesResult = await extractProductProperties(uniqueProducts);
          setAnalysisResults(prev => ({ ...prev, productProperties: propertiesResult }));
          toast({ title: t('analysisCompleteToastTitle'), description: t('propertiesExtractedToastDescription'), variant: 'default' });
        } else {
          toast({ title: t('analysisCompleteToastTitle'), description: t('noProductsToExtractPropertiesToastDescription'), variant: 'default' });
        }
      } else {
        setProgressValue(75); // Skip related products and properties
         toast({ title: t('analysisCompleteToastTitle'), description: t('noProductsToExtractPropertiesToastDescription'), variant: 'default' });
      }
      setProgressValue(100);

    } catch (err) {
      console.error('Erro no processamento da IA:', err);
      const msg = err instanceof Error ? err.message : t('errorToastTitle');
      setImageAnalysisError(msg);
      toast({ title: t('errorToastTitle'), description: msg, variant: 'destructive' });
    } finally {
      setIsProcessingImage(false);
      setCurrentStep(null);
    }
  };

  const handleSubmitImageAnalysis = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      const err = t('selectImageError');
      setImageAnalysisError(err);
      toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => processImageAnalysis(reader.result as string);
    reader.onerror = () => {
      const err = t('imageReadError');
      setImageAnalysisError(err);
      toast({ title: t('errorToastTitle'), description: err, variant: 'destructive' });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFindStoresForAnalyzedProduct = async (productName: string) => {
    setAnalysisResults(prev => ({
      ...prev,
      storeSearch: { ...prev.storeSearch, [productName]: { isLoading: true, stores: null, error: null } }
    }));
    const input: FindProductStoresInput = { productName, latitude: userLocation?.latitude, longitude: userLocation?.longitude };
    try {
      const storeResults = await findProductStores(input);
      setAnalysisResults(prev => ({
        ...prev,
        storeSearch: { ...prev.storeSearch, [productName]: { isLoading: false, stores: storeResults.foundStores, error: null } }
      }));
      toast({ title: storeResults.foundStores.length ? t('storesFoundToastTitle') : t('noStoresFoundToastTitle'), description: storeResults.foundStores.length ? t('storesFoundToastDescription', { productName }) : t('noStoresFoundToastDescription', { productName }), variant: 'default' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('findStoresErrorToastTitle');
      setAnalysisResults(prev => ({
        ...prev,
        storeSearch: { ...prev.storeSearch, [productName]: { isLoading: false, stores: null, error: msg } }
      }));
      toast({ title: t('findStoresErrorToastTitle'), description: msg, variant: 'destructive' });
    }
  };

  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    // Do not change isCameraActive here, it's controlled by button
  }, []);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (isCameraActive) {
        if (!navigator.mediaDevices?.getUserMedia) {
          toast({ variant: 'destructive', title: t('cameraAccessErrorTitle'), description: t('cameraGenericError') });
          setHasCameraPermission(false);
          setIsCameraActive(false);
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
          setHasCameraPermission(false);
          setIsCameraActive(false); // Turn off if permission denied
          toast({ variant: 'destructive', title: t('cameraAccessErrorTitle'), description: t('cameraAccessErrorMessage') });
        }
      } else {
        stopCameraStream();
      }
    };
    getCameraPermission();
    return () => stopCameraStream(); // Cleanup on unmount or if isCameraActive changes
  }, [isCameraActive, t, toast, stopCameraStream]);

  const handleToggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
    } else {
      setCapturedImagePreview(null);
      setSelectedFile(null); // Clear file selection
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setImageAnalysisError(null);
      setAnalysisResults(initialResultsState);
      setIsCameraActive(true);
    }
  };

  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current && isCameraActive && hasCameraPermission) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setCapturedImagePreview(dataUri);
      processImageAnalysis(dataUri);
      setIsCameraActive(false); // Stop camera after picture
    }
  };

  const hasAnyAnalysisResults = (analysisResults.objects && analysisResults.objects.length > 0) ||
    (analysisResults.relatedProducts && analysisResults.relatedProducts.length > 0) ||
    analysisResults.productProperties;

  // ----- Navegação e Conteúdo das Abas -----
  const renderTabContent = () => {
    switch (activeTab) {
      case 'deals':
        return (
          <div className="space-y-4 md:space-y-6">
            {!userLocation && !isRequestingLocation && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    {t('locationCardTitle')}
                  </CardTitle>
                  <CardDescription>{t('locationCardDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleRequestLocation} disabled={isRequestingLocation} variant="outline" size="sm">
                    {isRequestingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                    {isRequestingLocation ? t('gettingLocationButton') : t('getLocationButton')}
                  </Button>
                  {locationError && <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {locationError}</p>}
                </CardContent>
              </Card>
            )}
            {userLocation && (
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{t('locationAcquiredCard', {latitude: userLocation.latitude.toFixed(4), longitude: userLocation.longitude.toFixed(4)})}</span>
                </div>
            )}

            <div className="px-1"> {/* Add some padding for filter buttons */}
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('categoryFiltersTitle')}</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedCategory === null ? "default" : "outline"} onClick={() => setSelectedCategory(null)} size="sm">
                  {tAppLayout('allCategories')}
                </Button>
                {categories.map(cat => (
                  <Button key={cat.value} variant={selectedCategory === cat.value ? "default" : "outline"} onClick={() => setSelectedCategory(cat.value)} size="sm" className="text-xs sm:text-sm">
                    <cat.icon className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {isLoadingDeals && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">{tAppLayout('loadingDeals')}</p>
              </div>
            )}
            {!isLoadingDeals && displayedDeals.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">{t('noDealsFound')}</p>
                </CardContent>
              </Card>
            )}
            {!isLoadingDeals && displayedDeals.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayedDeals.map(deal => (
                  <Card key={deal.id} className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <div className="aspect-video w-full relative overflow-hidden rounded-t-lg bg-muted">
                      <NextImage src={deal.imageUrl} alt={deal.productName} layout="fill" objectFit="cover" data-ai-hint={deal.dataAiHint || deal.productName} />
                    </div>
                    <CardHeader className="p-3 md:p-4">
                      <CardTitle className="text-base md:text-lg line-clamp-2">{deal.productName}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-1 p-3 md:p-4 pt-0">
                      <p className="text-lg md:text-xl font-bold text-primary">
                        {new Intl.NumberFormat(currentLocale, { style: 'currency', currency: deal.currency }).format(deal.price)}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p className="flex items-center gap-1"><Store className="w-3 h-3" /> {t('dealCardStoreLabel')}: <span className="font-medium text-foreground truncate">{deal.storeName}</span></p>
                        {deal.distance && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {t('dealCardDistanceLabel')}: <span className="font-medium text-foreground">{deal.distance}</span></p>}
                        <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t('dealCardExpiresLabel')}: <span className="font-medium text-foreground">{deal.expiresIn}</span></p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 md:p-4">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs" size="sm">
                        <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                        {t('viewDealButton')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case 'identify':
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Wand2 className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                {t('uploadCardTitle')}
              </CardTitle>
              <CardDescription>{t('uploadCardDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmitImageAnalysis} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex-grow w-full">
                      <Label htmlFor="image-upload" className="sr-only">{t('analyzeButton')}</Label>
                      <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary file:font-semibold hover:file:bg-primary/10 text-sm" disabled={isProcessingImage || isRequestingLocation || isCameraActive} />
                    </div>
                    <Button type="button" onClick={handleToggleCamera} variant="outline" className="w-full sm:w-auto" size="sm" disabled={isProcessingImage || isRequestingLocation}>
                      {isCameraActive ? <Trash2 className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
                      {isCameraActive ? t('stopCameraButton') : t('useCameraButton')}
                    </Button>
                  </div>
                  {selectedFile && !isCameraActive && (
                    <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" size="sm" disabled={isProcessingImage || !selectedFile || isRequestingLocation}>
                      {isProcessingImage && currentStep ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('processingButton')}</>) : (<><Wand2 className="w-4 h-4 mr-2" />{t('analyzeButton')}</>)}
                    </Button>
                  )}
                </div>
                {imageAnalysisError && !isProcessingImage && (<p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {imageAnalysisError}</p>)}
              </form>

              {previewUrl && !isCameraActive && (
                <div className="mt-3 border rounded-lg p-2 bg-muted/50 overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                  <NextImage src={previewUrl} alt={t('uploadCardTitle')} layout="fill" objectFit="contain" className="rounded" data-ai-hint="uploaded image" />
                </div>
              )}

              {isCameraActive && (
                <div className="space-y-3 mt-3">
                  <h3 className="text-md font-medium flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> {t('cameraPreviewTitle')}</h3>
                  <div className="border rounded-lg overflow-hidden aspect-video relative w-full max-w-md mx-auto bg-muted">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline data-testid="camera-video-element" />
                  </div>
                  {hasCameraPermission === true && (<Button onClick={handleTakePicture} className="w-full sm:w-auto" size="sm" disabled={isProcessingImage}><Camera className="w-4 h-4 mr-2" />{t('takePictureButton')}</Button>)}
                </div>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>

              {hasCameraPermission === false && isCameraActive && (
                <Alert variant="destructive" className="mt-3"><CameraOff className="h-4 w-4" /><AlertTitle>{t('alertCameraAccessRequiredTitle')}</AlertTitle><AlertDescription>{t('alertCameraAccessRequiredDescription')}</AlertDescription></Alert>
              )}

              {capturedImagePreview && (<div className="space-y-2 mt-3">
                <h3 className="text-md font-medium flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> {t('capturedImagePreviewTitle')}</h3>
                <div className="border rounded-lg p-2 bg-muted/50 overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                  <NextImage src={capturedImagePreview} alt={t('capturedImagePreviewTitle')} layout="fill" objectFit="contain" className="rounded" data-ai-hint="captured camera image" />
                </div>
              </div>)}

            </CardContent>
            {isProcessingImage && currentStep && (
              <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                <Progress value={progressValue} className="w-full h-2" />
                <p className="text-sm text-muted-foreground">{t('progressMessage', { step: currentStep, progressValue })}</p>
              </CardFooter>
            )}

            {hasAnyAnalysisResults && !isProcessingImage && (
              <CardContent className="pt-6 border-t mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t('resultsTitle')}</h3>
                {analysisResults.objects && analysisResults.objects.length > 0 && (
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    <AccordionItem value="item-0">
                      <AccordionTrigger>{t('identifiedObjectsCardTitle')}</AccordionTrigger>
                      <AccordionContent>
                        {analysisResults.objects.map((item, index) => (
                          <div key={`${item.original}-${index}`} className="mb-2 p-2 border-b">
                            <p className="font-semibold">{t('objectOriginalLabel')}: {item.original}</p>
                            <ul className="list-disc pl-5 text-sm">
                              {Object.entries(item.translations).map(([langCode, translation]) => translation && tLang.rich(langCode as any) && (
                                <li key={langCode}>{tLang(langCode as any)}: {translation}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                {analysisResults.relatedProducts && analysisResults.relatedProducts.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                     <AccordionItem value="item-1">
                        <AccordionTrigger>{t('relatedProductsCardTitle')}</AccordionTrigger>
                        <AccordionContent>
                          {analysisResults.relatedProducts.map((item) => item.relatedProducts.length > 0 && (
                            <div key={item.objectName} className="mb-2 p-2 border-b">
                              <p className="font-semibold">{t('relatedProductsForLabel', { objectName: item.objectName })}</p>
                              <ul className="list-disc pl-5 text-sm">
                                {item.relatedProducts.map((product, idx) => (
                                  <li key={idx} className="flex justify-between items-center py-1">
                                    <span>{product}</span>
                                    <Button size="xs" variant="outline" onClick={() => handleFindStoresForAnalyzedProduct(product)} disabled={analysisResults.storeSearch[product]?.isLoading || isProcessingImage || isRequestingLocation}>
                                      {analysisResults.storeSearch[product]?.isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Store className="w-3 h-3 mr-1" />}
                                      {t('findStoresButton')}
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                               {analysisResults.storeSearch[item.objectName]?.stores?.map((store, sIdx) => <Badge key={sIdx}>{store}</Badge>)}
                            </div>
                          ))}
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            )}
             {!isProcessingImage && !hasAnyAnalysisResults && (selectedFile || capturedImagePreview) && !imageAnalysisError && !(analysisResults.objects && analysisResults.objects.length === 0) && (
                <CardContent className="pt-6 border-t mt-4">
                    <p className="text-muted-foreground text-sm">{t('analysisCompleteNoDetails')}</p>
                </CardContent>
            )}
          </Card>
        );
      case 'map':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MapPin className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground opacity-50">{tAppLayout('mapTabTitle')}</h2>
            <p className="text-muted-foreground opacity-50">{tAppLayout('mapFeatureComingSoon')}</p>
          </div>
        );
      case 'account':
        if (authLoading) {
          return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        }
        if (!user) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
              <UserCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold">{tAppLayout('accountGuestTitle')}</h2>
              <p className="text-muted-foreground">{tAppLayout('accountGuestMessage')}</p>
              <Button onClick={() => router.push(`/${currentLocale}/login`)}>{tAuth('loginTitle')}</Button>
              <Button variant="outline" onClick={() => router.push(`/${currentLocale}/signup`)}>{tAuth('signUpTitle')}</Button>
            </div>
          );
        }
        return (
          <div className="space-y-6 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="w-6 h-6 text-primary"/> {tAppLayout('accountMyProfile')}</CardTitle>
                <CardDescription>{tAppLayout('accountManageProfile')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm"><strong>{tAuth('emailLabel')}:</strong> {user.email}</p>
                {/* Futuramente: botão para editar perfil de usuário (nome, etc) */}
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Store className="w-6 h-6 text-primary"/> {tAuth('myStore')}</CardTitle>
                    <CardDescription>{tAppLayout('accountManageStore')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push(`/${currentLocale}/profile/store`)} className="w-full">
                        {tAppLayout('accountGoToStoreProfile')}
                    </Button>
                </CardContent>
            </Card>
            <Button variant="destructive" onClick={async () => { await logout(); router.push(`/${currentLocale}/`); }} className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> {tAuth('logoutButton')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'identify' && !isCameraActive && !selectedFile && !capturedImagePreview) {
      // Optionally auto-trigger camera or reset state
    }
  };

  const handleCameraIconClick = () => {
    setActiveTab('identify');
    if (!isCameraActive) {
      handleToggleCamera(); // This will also clear other image states
    }
  }

  const navItems = [
    { name: 'deals', label: tAppLayout('dealsTabTitle'), icon: LayoutGrid },
    { name: 'identify', label: tAppLayout('identifyTabTitle'), icon: ScanSearch },
    { name: 'map', label: tAppLayout('mapTabTitle'), icon: MapPin, disabled: true },
    { name: 'account', label: tAppLayout('accountTabTitle'), icon: UserCircle },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BadgePercent className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
              {t('title')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCameraIconClick} aria-label={tAppLayout('openCameraToIdentify')}>
              <Camera className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={tAppLayout('mainMenu')}>
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{tAppLayout('menuLabel')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => router.push(`/${currentLocale}/profile/store`)} disabled={authLoading || !user}>
                    <Store className="mr-2 h-4 w-4" />
                    <span>{tAuth('myStore')}</span>
                  </DropdownMenuItem>
                  {/* Adicionar link para Perfil de Usuário aqui quando existir */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <div className="px-2 py-1.5 text-sm"> {/* Wrapper para aplicar padding */}
                        <LanguageSwitcher />
                    </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={() => router.push(`/${currentLocale}/monitoring`)}>
                    <BarChartHorizontalBig className="mr-2 h-4 w-4" />
                    <span>{tAppLayout('monitoringPageLink')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push(`/${currentLocale}/admin/super-agent-chat`)}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>{tAppLayout('superAgentChatPageLink')}</span>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AuthNav isDropdownItem={true} /> 
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {activeTab === 'deals' && (
             <div className="container px-4 pb-3">
                <Input
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm h-9 w-full"
                />
            </div>
        )}
      </header>

      {/* Main Content - Fills space between header and nav, and scrolls */}
      <main className="flex-grow overflow-y-auto p-4 pb-[80px]"> {/* Padding bottom to avoid overlap with nav */}
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-4">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={`flex h-full flex-col items-center justify-center gap-1 rounded-none text-xs hover:bg-accent/50 ${
                activeTab === item.name ? 'text-primary font-semibold border-t-2 border-primary' : 'text-muted-foreground'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !item.disabled && handleTabChange(item.name as TabName)}
              disabled={item.disabled}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
