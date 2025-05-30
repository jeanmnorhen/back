
'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide Image icon
import { UploadCloud, Image as ImageIcon, Loader2, AlertTriangle, Wand2, ScanSearch, ShoppingBag, Tags, PackageSearch } from 'lucide-react';

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
import { identifyObjects, type IdentifyObjectsOutput } from '@/ai/flows/identify-objects';
import { searchRelatedProducts, type SearchRelatedProductsOutput } from '@/ai/flows/search-related-products';
import { extractProductProperties, type ExtractProductPropertiesOutput } from '@/ai/flows/extract-product-properties';

type AnalysisResults = {
  objects: IdentifyObjectsOutput['objects'] | null;
  relatedProducts: SearchRelatedProductsOutput['products'] | null;
  productProperties: ExtractProductPropertiesOutput | null;
};

const initialResultsState: AnalysisResults = {
  objects: null,
  relatedProducts: null,
  productProperties: null,
};

export default function ImageInsightExplorerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults>(initialResultsState);

  const { toast } = useToast();

  useEffect(() => {
    // Clean up preview URL when component unmounts or file changes
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
        setError('File is too large. Maximum size is 5MB.');
        toast({ title: 'Error', description: 'File is too large. Maximum size is 5MB.', variant: 'destructive' });
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type. Please upload an image.');
        toast({ title: 'Error', description: 'Invalid file type. Please upload an image.', variant: 'destructive' });
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
      setCurrentStep('Identifying objects...');
      setProgressValue(25);
      const objectsResult = await identifyObjects({ photoDataUri: imageDataUri });
      if (!objectsResult || !objectsResult.objects || objectsResult.objects.length === 0) {
        toast({ title: 'Analysis Complete', description: 'No objects identified in the image.', variant: 'default' });
        setResults(prev => ({ ...prev, objects: [] }));
        setProgressValue(100);
        setIsLoading(false);
        setCurrentStep(null);
        return;
      }
      setResults(prev => ({ ...prev, objects: objectsResult.objects }));
      toast({ title: 'Step Complete', description: 'Objects identified successfully!', variant: 'default' });
      setProgressValue(50);

      setCurrentStep('Searching for related products...');
      const relatedProductsResult = await searchRelatedProducts({ objects: objectsResult.objects });
       if (!relatedProductsResult || !relatedProductsResult.products || Object.keys(relatedProductsResult.products).length === 0) {
          toast({ title: 'Step Complete', description: 'No related products found.', variant: 'default' });
          setResults(prev => ({...prev, relatedProducts: {}}))
      } else {
        setResults(prev => ({ ...prev, relatedProducts: relatedProductsResult.products }));
        toast({ title: 'Step Complete', description: 'Related products found!', variant: 'default' });
      }
      setProgressValue(75);
      
      const allProducts: string[] = [];
      if (relatedProductsResult && relatedProductsResult.products) {
        Object.values(relatedProductsResult.products).forEach(productList => {
          productList.forEach(product => {
            if (!allProducts.includes(product)) {
              allProducts.push(product);
            }
          });
        });
      }
      
      if (allProducts.length > 0) {
        setCurrentStep('Extracting product properties...');
        const propertiesResult = await extractProductProperties(allProducts);
        setResults(prev => ({ ...prev, productProperties: propertiesResult }));
        toast({ title: 'Analysis Complete', description: 'Product properties extracted!', variant: 'default' });
      } else {
         toast({ title: 'Analysis Update', description: 'No products to extract properties from. Skipping property extraction.', variant: 'default' });
      }
      setProgressValue(100);

    } catch (err) {
      console.error('Error during AI processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file.');
      toast({ title: 'Error', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result as string;
      processImage(imageDataUri);
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      toast({ title: 'Error', description: 'Failed to read the image file.', variant: 'destructive' });
    }
    reader.readAsDataURL(selectedFile);
  };

  const hasResults = results.objects || results.relatedProducts || results.productProperties;

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
          Upload an image to identify objects and discover related products and their properties.
        </p>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UploadCloud className="w-7 h-7 text-primary" />
              Upload Your Image
            </CardTitle>
            <CardDescription>Select an image file (PNG, JPG, GIF, etc.) up to 5MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="image-upload" className="sr-only">Choose image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file:text-primary file:font-semibold hover:file:bg-primary/10"
                  disabled={isLoading}
                />
              </div>
              {previewUrl && (
                <div className="mt-4 border rounded-lg p-2 bg-muted/50 overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                  <NextImage
                    src={previewUrl}
                    alt="Selected image preview"
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
              <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !selectedFile}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Analyze Image
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

        {hasResults && !isLoading && (
          <div className="space-y-8">
            <Separator />
            <h2 className="text-3xl font-semibold text-center text-primary">Analysis Results</h2>
            
            {results.objects && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ScanSearch className="w-6 h-6 text-primary" />
                    Identified Objects
                  </CardTitle>
                  {results.objects.length === 0 && <CardDescription>No objects were clearly identified in the image.</CardDescription>}
                </CardHeader>
                {results.objects.length > 0 && (
                    <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {results.objects.map((obj, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{obj}</Badge>
                        ))}
                    </div>
                    </CardContent>
                )}
              </Card>
            )}

            {results.relatedProducts && Object.keys(results.relatedProducts).length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    Related Products
                  </CardTitle>
                  <CardDescription>Products found related to the identified objects.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(results.relatedProducts).map(([object, products]) => (
                      products.length > 0 && (
                        <AccordionItem key={object} value={object}>
                            <AccordionTrigger className="text-base font-medium hover:text-primary">
                                <div className="flex items-center gap-2">
                                    <PackageSearch className="w-5 h-5 text-muted-foreground"/>
                                    Products for: <span className="font-semibold text-foreground">{object}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                            {products.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {products.map((product, index) => (
                                    <li key={index}>{product}</li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No specific products found for {object}.</p>
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
                    Product Properties
                  </CardTitle>
                  <CardDescription>Key properties extracted for the identified products.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {results.productProperties.map((productItem) => (
                      productItem.properties.length > 0 && (
                        <AccordionItem key={productItem.product} value={productItem.product}>
                            <AccordionTrigger className="text-base font-medium hover:text-primary">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-muted-foreground"/>
                                    Properties for: <span className="font-semibold text-foreground">{productItem.product}</span>
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
                                <p className="text-sm text-muted-foreground italic">No specific properties found for {productItem.product}.</p>
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
        {/* Fallback for when no results are displayed after loading (e.g. no objects identified) */}
        {!isLoading && !hasResults && selectedFile && !error && (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">Analysis Complete</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The image was processed, but no further details could be extracted based on the initial findings. You can try with a different image.</p>
                </CardContent>
            </Card>
        )}

      </main>
      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t w-full max-w-4xl">
        <p>&copy; {new Date().getFullYear()} Image Insight Explorer. Powered by Genkit AI.</p>
      </footer>
    </div>
  );
}
