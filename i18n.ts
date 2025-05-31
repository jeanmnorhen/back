// i18n.ts (AT PROJECT ROOT)
console.log(`[i18n.ts - ROOT - HARDCODED TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'pt'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - HARDCODED TEST] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - HARDCODED TEST] Invalid locale received: "${locale}". Supported: ${locales.join(', ')}. Calling notFound().`);
    notFound();
  }

  let messages;
  // For this test, we directly define messages instead of importing them.
  if (locale === 'en') {
    messages = {
      Locale: "en",
      Layout: {
        title: "HARDCODED: Real Price - Local Deals & Product Finder",
        description: "HARDCODED: Find products advertised by local stores, check prices, and discover deals near you. For shoppers and store owners."
      },
      AppLayout: {
        dealsTabTitle: "Deals",
        identifyTabTitle: "Identify",
        mapTabTitle: "Map",
        accountTabTitle: "Account",
        mapFeatureComingSoon: "Map feature coming soon!",
        menuLabel: "Menu",
        openCameraToIdentify: "Open Camera to Identify Product",
        mainMenu: "Main Menu",
        monitoringPageLink: "Monitoring",
        superAgentChatPageLink: "Agent Chat",
        allCategories: "All",
        unknownStore: "Unknown Store",
        fetchDealsErrorTitle: "Error Fetching Deals",
        loadingDeals: "Loading deals...",
        accountGuestTitle: "My Account",
        accountGuestMessage: "Log in or sign up to access your account and store profile.",
        accountMyProfile: "My Profile",
        accountManageProfile: "View and manage your user profile information.",
        accountManageStore: "Manage your store's profile and advertisements.",
        accountGoToStoreProfile: "Go to Store Profile"
      },
      ImageInsightExplorerPage: {
        title: "HARDCODED: Real Price EN",
        description: "HARDCODED: Discover local deals or analyze an image...",
        uploadCardTitle: "Identify Product by Image",
        uploadCardDescription: "Got an item? Upload its image (PNG, JPG, GIF, etc.) up to 5MB or use your camera. Then find offers for it!",
        fileSizeError: "File too large. Maximum size is 5MB.",
        fileTypeError: "Invalid file type. Please upload an image.",
        selectImageError": "Please select an image file.",
        processingButton: "Processing...",
        analyzeButton: "Identify from Image",
        useCameraButton: "Use Camera",
        takePictureButton: "Take Photo",
        cameraPreviewTitle: "Camera Preview",
        capturedImagePreviewTitle: "Captured Photo Preview",
        stopCameraButton: "Stop Camera",
        cameraAccessErrorTitle: "Camera Access Denied",
        cameraAccessErrorMessage": "Please enable camera permissions in your browser settings to use this feature.",
        cameraGenericError: "Could not access the camera. Please ensure it's not in use by another application and try again.",
        alertCameraAccessRequiredTitle: "Camera Access Required",
        alertCameraAccessRequiredDescription": "Please allow camera access in your browser to use this feature.",
        progressMessage: "{step} ({progressValue}%)",
        locationCardTitle: "Your Location",
        locationCardDescription: "Allow access to your location to find deals near you and optimize store searches.",
        getLocationButton: "Get My Current Location",
        gettingLocationButton: "Getting Location...",
        locationAcquiredToast: "Your location has been successfully obtained!",
        locationAcquiredCard": "Your location: Lat {latitude}, Lng {longitude}.",
        locationErrorToastTitle: "Geolocation Error",
        resultsTitle: "Identification Results",
        identifiedObjectsCardTitle: "Identified Objects & Translations",
        identifiedObjectsCardDescription": "Objects found in the image with their translations. Use these to search for deals.",
        objectOriginalLabel: "Original",
        noTranslationsAvailable": "No translations available for {objectName}.",
        relatedProductsCardTitle: "Related Product Ideas",
        relatedProductsCardDescription": "Product ideas found related to the identified objects (based on original names).",
        relatedProductsForLabel": "Product ideas for: {objectName}",
        findStoresButton: "Find Deals",
        findingStoresButton: "Finding deals...",
        storesFoundToastTitle: "Deals Found",
        storesFoundToastDescription": "Deals found for {productName}.",
        noStoresFoundToastTitle: "No Deals Found",
        noStoresFoundToastDescription": "No deals or stores found for {productName} at the moment.",
        findStoresErrorToastTitle: "Error Finding Deals",
        noStoresFoundForProduct": "No deals currently found for {productName}.",
        availableInLabel: "Available in:",
        productPropertiesCardTitle: "Product Properties (from Image)",
        productPropertiesCardDescription": "Key properties extracted for the identified products (if any).",
        propertiesForLabel: "Properties for: {productName}",
        noPropertiesFound": "No specific properties found for {productName}.",
        analysisCompleteNoDetails": "The image was processed, but no specific details could be extracted. You can try with a different image or search directly.",
        footerText: "© {year} Real Price. Find local deals.",
        translationsProvidedFor": "Translations provided for: Spanish, French, German, Chinese (Simplified), Japanese, Portuguese (Brazil), Portuguese (Portugal).",
        stepIdentifyingObjects: "Identifying & translating objects from image...",
        stepSearchingProducts: "Searching for related product ideas (AI)...",
        stepExtractingProperties: "Extracting product properties (AI)...",
        stepCompletedToastTitle: "Step Completed",
        identifiedObjectsToastDescription": "Objects identified and translated successfully from image!",
        noObjectsIdentifiedToastDescription": "No objects clearly identified in the image.",
        noRelatedProductsToastDescription": "No related product ideas found for the objects.",
        relatedProductsFoundToastDescription": "Related product ideas found!",
        analysisCompleteToastTitle: "Image Analysis Complete",
        propertiesExtractedToastDescription": "Product properties extracted from image!",
        noProductsToExtractPropertiesToastDescription": "No products to extract properties from. Property extraction step skipped.",
        errorToastTitle: "Error",
        imageReadError: "Failed to read image file.",
        searchSectionTitle: "Find Local Deals",
        searchPlaceholder: "Search products, services, or stores...",
        categoryFiltersTitle: "Filter by Category",
        dealsFeedTitle: "Deals Near You",
        noDealsFound: "No deals found nearby at the moment. Check back later or try different filters!",
        dealCardPriceLabel: "Price",
        dealCardStoreLabel: "Store",
        dealCardDistanceLabel": "Distance",
        dealCardExpiresLabel: "Expires",
        categorySnacks: "Snacks",
        categoryPizzas: "Pizzas",
        categoryDrinks: "Drinks",
        categoryGrocery: "Grocery",
        viewDealButton: "View Deal"
      },
      Languages: {
        es: "Spanish",
        fr: "French",
        de: "German",
        zh: "Chinese (Simplified)",
        ja: "Japanese",
        pt_BR: "Portuguese (Brazil)",
        pt_PT: "Portuguese (Portugal)"
      },
      LanguageSwitcher: {
        selectLanguage: "Select Language",
        english: "English",
        portuguese": "Portuguese"
      }
    };
    console.log(`[i18n.ts - ROOT - HARDCODED TEST] Successfully assigned HARDCODED EN messages for locale "${locale}"`);
  } else if (locale === 'pt') {
    messages = {
      Locale: "pt",
      Layout: {
        title: "HARDCODED: Preço Real - Ofertas Locais e Buscador de Produtos",
        description: "HARDCODED: Encontre produtos anunciados por lojas locais, confira preços e descubra ofertas perto de você. Para consumidores e lojistas."
      },
      AppLayout: {
        dealsTabTitle: "Ofertas",
        identifyTabTitle: "Identificar",
        mapTabTitle: "Mapa",
        accountTabTitle: "Conta",
        mapFeatureComingSoon: "Funcionalidade de mapa em breve!",
        menuLabel: "Menu",
        openCameraToIdentify: "Abrir Câmera para Identificar Produto",
        mainMenu: "Menu Principal",
        monitoringPageLink: "Monitoramento",
        superAgentChatPageLink: "Chat com Agente",
        allCategories: "Todas",
        unknownStore: "Loja Desconhecida",
        fetchDealsErrorTitle: "Erro ao Buscar Ofertas",
        loadingDeals: "Carregando ofertas...",
        accountGuestTitle: "Minha Conta",
        accountGuestMessage": "Faça login ou cadastre-se para acessar sua conta e perfil de loja.",
        accountMyProfile: "Meu Perfil",
        accountManageProfile: "Veja e gerencie as informações do seu perfil de usuário.",
        accountManageStore: "Gerencie o perfil e os anúncios da sua loja.",
        accountGoToStoreProfile: "Ir para Perfil da Loja"
      },
      ImageInsightExplorerPage: {
        title: "HARDCODED: Preço Real PT",
        description: "HARDCODED: Descubra ofertas locais ou analise uma imagem...",
        uploadCardTitle: "Identificar Produto por Imagem",
        uploadCardDescription": "Tem um item? Envie a imagem dele (PNG, JPG, GIF, etc.) até 5MB ou use sua câmera. Depois, encontre ofertas!",
        fileSizeError: "Arquivo muito grande. O tamanho máximo é 5MB.",
        fileTypeError: "Tipo de arquivo inválido. Por favor, envie uma imagem.",
        selectImageError": "Por favor, selecione um arquivo de imagem.",
        processingButton: "Processando...",
        analyzeButton: "Identificar da Imagem",
        useCameraButton: "Usar Câmera",
        takePictureButton: "Tirar Foto",
        cameraPreviewTitle: "Pré-visualização da Câmera",
        capturedImagePreviewTitle: "Pré-visualização da Foto Capturada",
        stopCameraButton: "Parar Câmera",
        cameraAccessErrorTitle: "Acesso à Câmera Negado",
        cameraAccessErrorMessage": "Por favor, habilite a permissão de acesso à câmera nas configurações do seu navegador para usar esta funcionalidade.",
        cameraGenericError: "Não foi possível acessar a câmera. Verifique se ela não está em uso por outro aplicativo e tente novamente.",
        alertCameraAccessRequiredTitle: "Acesso à Câmera Necessário",
        alertCameraAccessRequiredDescription": "Por favor, permita o acesso à câmera no seu navegador para usar esta funcionalidade.",
        progressMessage: "{step} ({progressValue}%)",
        locationCardTitle: "Sua Localização",
        locationCardDescription": "Permita o acesso à sua localização para encontrar ofertas perto de você e otimizar buscas por lojas.",
        getLocationButton: "Obter Minha Localização Atual",
        gettingLocationButton: "Obtendo Localização...",
        locationAcquiredToast: "Sua localização foi obtida com sucesso!",
        locationAcquiredCard": "Sua localização: Lat {latitude}, Lng {longitude}.",
        locationErrorToastTitle: "Erro de Geolocalização",
        resultsTitle: "Resultados da Identificação (via Imagem)",
        identifiedObjectsCardTitle: "Objetos Identificados & Traduções (via Imagem)",
        identifiedObjectsCardDescription": "Objetos encontrados na imagem com suas traduções. Use-os para buscar ofertas.",
        objectOriginalLabel: "Original",
        noTranslationsAvailable": "Nenhuma tradução disponível para {objectName}.",
        relatedProductsCardTitle: "Ideias de Produtos Relacionados (via Imagem)",
        relatedProductsCardDescription": "Ideias de produtos encontradas relacionadas aos objetos identificados (baseado nos nomes originais).",
        relatedProductsForLabel": "Ideias de produtos para: {objectName}",
        findStoresButton: "Encontrar Ofertas",
        findingStoresButton: "Buscando ofertas...",
        storesFoundToastTitle: "Ofertas Encontradas",
        storesFoundToastDescription": "Ofertas encontradas para {productName}.",
        noStoresFoundToastTitle: "Nenhuma Oferta Encontrada",
        noStoresFoundToastDescription": "Nenhuma oferta ou loja encontrada para {productName} no momento.",
        findStoresErrorToastTitle: "Erro ao Encontrar Ofertas",
        noStoresFoundForProduct": "Nenhuma oferta encontrada atualmente para {productName}.",
        availableInLabel: "Disponível em:",
        productPropertiesCardTitle: "Propriedades dos Produtos (via Imagem)",
        productPropertiesCardDescription": "Principais propriedades extraídas para os produtos identificados na imagem (se houver).",
        propertiesForLabel: "Propriedades para: {productName}",
        noPropertiesFound": "Nenhuma propriedade específica encontrada para {productName}.",
        analysisCompleteNoDetails": "A imagem foi processada, mas nenhum detalhe específico pôde ser extraído. Você pode tentar com uma imagem diferente ou buscar diretamente.",
        footerText: "© {year} Preço Real. Encontre ofertas locais.",
        translationsProvidedFor": "Traduções fornecidas para: Espanhol, Francês, Alemão, Chinês (Simplificado), Japonês, Português (Brasil), Português (Portugal).",
        stepIdentifyingObjects: "Identificando & traduzindo objetos da imagem...",
        stepSearchingProducts: "Buscando ideias de produtos relacionados (IA)...",
        stepExtractingProperties: "Extraindo propriedades dos produtos (IA)...",
        stepCompletedToastTitle: "Etapa Concluída",
        identifiedObjectsToastDescription": "Objetos identificados e traduzidos com sucesso a partir da imagem!",
        noObjectsIdentifiedToastDescription": "Nenhum objeto claramente identificado na imagem.",
        noRelatedProductsToastDescription": "Nenhuma ideia de produto relacionado encontrada para os objetos.",
        relatedProductsFoundToastDescription": "Ideias de produtos relacionados encontradas!",
        analysisCompleteToastTitle: "Análise da Imagem Concluída",
        propertiesExtractedToastDescription": "Propriedades dos produtos extraídas da imagem!",
        noProductsToExtractPropertiesToastDescription": "Nenhum produto para extrair propriedades. Etapa de extração de propriedades ignorada.",
        errorToastTitle: "Erro",
        imageReadError: "Falha ao ler o arquivo de imagem.",
        searchSectionTitle: "Encontre Ofertas Locais",
        searchPlaceholder: "Buscar produtos, serviços ou lojas...",
        categoryFiltersTitle: "Filtrar por Categoria",
        dealsFeedTitle: "Ofertas Próximas de Você",
        noDealsFound: "Nenhuma oferta encontrada por perto no momento. Volte mais tarde ou tente filtros diferentes!",
        dealCardPriceLabel: "Preço",
        dealCardStoreLabel": "Loja",
        dealCardDistanceLabel": "Distância",
        dealCardExpiresLabel: "Expira",
        categorySnacks: "Lanches",
        categoryPizzas: "Pizzas",
        categoryDrinks: "Bebidas",
        categoryGrocery: "Mercado",
        viewDealButton: "Ver Oferta"
      },
      Languages: {
        es: "Espanhol",
        fr: "Francês",
        de: "Alemão",
        zh: "Chinês (Simplificado)",
        ja: "Japonês",
        pt_BR: "Português (Brasil)",
        pt_PT: "Português (Portugal)"
      },
      LanguageSwitcher: {
        selectLanguage: "Selecionar Idioma",
        english: "Inglês",
        portuguese": "Português"
      }
    };
    console.log(`[i18n.ts - ROOT - HARDCODED TEST] Successfully assigned HARDCODED PT messages for locale "${locale}"`);
  } else {
    // Fallback for unhandled locales, though the initial check should prevent this.
    console.error(`[i18n.ts - ROOT - HARDCODED TEST] Locale "${locale}" does not have hardcoded messages. This should not happen.`);
    notFound();
  }

  return {
    messages
  };
});
