
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
// import { getAuth } from "firebase/auth"; // Descomente se for usar autenticação
// import { getFirestore } from "firebase/firestore"; // Descomente se for usar Firestore
// import { getStorage } from "firebase/storage"; // Descomente se for usar Storage

console.log("--------------------------------------------------------------------------------------");
console.log("[Firebase Setup V2] Iniciando Diagnóstico Detalhado de Variáveis de Ambiente Firebase...");
console.log("--------------------------------------------------------------------------------------");

const firebaseEnvVars = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let allCriticalVarsPresent = true;
for (const [key, value] of Object.entries(firebaseEnvVars)) {
  console.log(`[Firebase Setup V2] Variável de Ambiente Lida: ${key} = "${value === undefined ? 'UNDEFINED' : (value === '' ? 'EMPTY_STRING' : value)}"`);
  if (key === 'NEXT_PUBLIC_FIREBASE_API_KEY' || key === 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' || key === 'NEXT_PUBLIC_FIREBASE_DATABASE_URL') {
    if (value === undefined || value === '') {
      console.error(`[Firebase Setup V2] ERRO CRÍTICO IMEDIATO: Variável de ambiente OBRIGATÓRIA "${key}" está ausente ou vazia.`);
      allCriticalVarsPresent = false;
    }
  }
}

if (!allCriticalVarsPresent) {
  const criticalErrorMessage = `
    --------------------------------------------------------------------------------------
    [Firebase Setup V2] ERRO CRÍTICO DE CONFIGURAÇÃO DO FIREBASE (Server Log Pré-Inicialização)
    --------------------------------------------------------------------------------------
    UMA OU MAIS variáveis de ambiente CRÍTICAS do Firebase (API_KEY, PROJECT_ID, DATABASE_URL) estão AUSENTES ou VAZIAS.
    Isso impede a inicialização do Firebase.
    Consulte os logs acima para ver qual(is) variável(is) específica(s) está(ão) faltando.

    >>> VERIFIQUE IMEDIATAMENTE AS VARIÁVEIS DE AMBIENTE NO SEU PROJETO VERCEL: <<<
    1. Acesse: Vercel Dashboard -> Seu Projeto -> Settings -> Environment Variables.
    2. Confirme que TODAS as variáveis NEXT_PUBLIC_FIREBASE_* necessárias (especialmente API_KEY, PROJECT_ID, DATABASE_URL) existem, estão escritas corretamente e possuem valores válidos.
    3. Garanta que as variáveis estão disponíveis para o ambiente correto (Production, Preview, Development).
    4. FAÇA UM NOVO DEPLOY após qualquer correção.
    --------------------------------------------------------------------------------------
  `;
  console.error(criticalErrorMessage);
  throw new Error(
    `Firebase setup halted due to missing critical environment variables. Check Vercel server logs for details. ` +
    `ACTION REQUIRED: Verify NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_DATABASE_URL in your Vercel project settings.`
  );
}

const dbURL = firebaseEnvVars.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

console.log(`[Firebase Setup V2] Valor sendo usado para databaseURL (de NEXT_PUBLIC_FIREBASE_DATABASE_URL): "${dbURL}"`);

if (typeof dbURL !== 'string' || !dbURL.startsWith('https://')) {
  const dbUrlErrorMessage = `
    --------------------------------------------------------------------------------------
    [Firebase Setup V2] ERRO CRÍTICO DE CONFIGURAÇÃO DO FIREBASE (Server Log - Validação DATABASE_URL)
    --------------------------------------------------------------------------------------
    A variável de ambiente NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") é inválida. Deve ser uma string começando com "https://".
    Isso impede a inicialização do Firebase Realtime Database.
    
    >>> VERIFIQUE IMEDIATAMENTE A VARIÁVEL 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' NO SEU PROJETO VERCEL: <<<
    1. Acesse: Vercel Dashboard -> Seu Projeto -> Settings -> Environment Variables.
    2. Confirme que 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' possui o URL HTTPS completo do seu Firebase Realtime Database.
       Exemplo: "https://seu-projeto-id-default-rtdb.firebaseio.com" ou "https://seu-projeto-id-default-rtdb.sua-regiao.firebasedatabase.app"
    3. FAÇA UM NOVO DEPLOY após qualquer correção.
    --------------------------------------------------------------------------------------
  `;
  console.error(dbUrlErrorMessage);
  throw new Error(
    `Firebase setup halted. CRITICAL: The NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable is invalid (received: "${dbURL}", expected format: "https://..."). ` +
    `ACTION REQUIRED: Correct this in your Vercel project settings.`
  );
}


if (dbURL && !dbURL.endsWith('.firebaseio.com') && !dbURL.endsWith('.firebasedatabase.app')) {
  console.warn(
    `[Firebase Setup V2] POTENCIAL_INCOMPATIBILIDADE_DE_CONFIG: Sua NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") NÃO termina com '.firebaseio.com' ou '.firebasedatabase.app'. 
    Embora possa ser válido para configurações Firebase mais novas, se encontrar erros "Cannot parse Firebase url" do SDK que mencionem especificamente um formato (ex: ".firebaseio.com"),
    pode ser necessário garantir que sua URL corresponda a esse formato. Verifique no seu console Firebase o URL exato do Realtime Database.`
  );
}


const firebaseConfig = {
  apiKey: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: dbURL,
  storageBucket: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: firebaseEnvVars.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase
let app: FirebaseApp;
if (!getApps().length) {
  try {
    console.log("[Firebase Setup V2] Tentando inicializar o app Firebase com a configuração (apiKey e databaseURL mostrados para depuração em Vercel logs, serão omitidos em outros contextos):", { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey : "API_KEY_AUSENTE_NA_CONFIG", databaseURL: firebaseConfig.databaseURL });
    app = initializeApp(firebaseConfig);
    console.log("[Firebase Setup V2] App Firebase inicializado com sucesso.");
  } catch (error: any) {
    console.error(`[Firebase Setup V2] FIREBASE_INIT_APP_ERROR: Erro durante initializeApp. Configuração usada:`, { ...firebaseConfig, apiKey: "[OMITIDO_NO_LOG_DE_ERRO]" }, `Erro original:`, error.message, error.stack);
    throw new Error(
      `A inicialização do app Firebase falhou (initializeApp). Isso geralmente ocorre devido a valores ausentes ou incorretos em NEXT_PUBLIC_FIREBASE_PROJECT_ID ou NEXT_PUBLIC_FIREBASE_API_KEY. Verifique os logs do servidor Vercel. Erro original: ${error.message}.`
      );
  }
} else {
  app = getApp();
  console.log("[Firebase Setup V2] Usando instância existente do app Firebase.");
}

let db: Database;
try {
  const effectiveDbURLFromApp = app.options.databaseURL;
  console.log("[Firebase Setup V2] Tentando obter instância do Database. databaseURL efetiva das opções do app Firebase:", effectiveDbURLFromApp);

  if (!effectiveDbURLFromApp || typeof effectiveDbURLFromApp !== 'string' || !effectiveDbURLFromApp.startsWith('https://') ) {
      const getDbConfigErrorMsg = `[Firebase Setup V2] FIREBASE_GET_DATABASE_PRE_CHECK_ERROR: A databaseURL efetiva ('${effectiveDbURLFromApp}') da instância do app Firebase é inválida ou ausente. Isso é derivado de NEXT_PUBLIC_FIREBASE_DATABASE_URL. Verifique sua configuração na Vercel.`;
      console.error(getDbConfigErrorMsg);
      throw new Error(getDbConfigErrorMsg);
  }

  db = getDatabase(app);
  console.log("[Firebase Setup V2] Instância do Firebase Database obtida com sucesso.");
} catch (error: any) {
   const finalEffectiveDbURL = app.options.databaseURL;
   const detailedErrorMessageForGetDatabase = `
    --------------------------------------------------------------------------------------
    FALHA CRÍTICA NA INICIALIZAÇÃO DO BANCO DE DADOS FIREBASE (DURANTE GET_DATABASE) - V2
    --------------------------------------------------------------------------------------
    Falha ao obter instância do Firebase Database: getDatabase(app).
    Erro SDK: "${error.message}" (Código: ${error.code || 'N/A'})
    Isto geralmente significa que 'databaseURL' está incorreta, malformada, ou o SDK não consegue acessá-la.

    URL efetiva usada pelo SDK nesta tentativa: '${finalEffectiveDbURL}'
    (Esta URL veio de NEXT_PUBLIC_FIREBASE_DATABASE_URL, cujo valor inicial foi: '${firebaseEnvVars.NEXT_PUBLIC_FIREBASE_DATABASE_URL}')

    >>> AÇÃO NECESSÁRIA - VERIFIQUE AS VARIÁVEIS DE AMBIENTE DA VERCEL <<<
    1. REVEJA CUIDADOSAMENTE 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' nas "Environment Variables" do seu projeto Vercel.
    2. COPIE EXATAMENTE da seção Realtime Database do seu Firebase Console.
    3. A mensagem de erro do Firebase (ex: "Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com") é uma PISTA IMPORTANTE. Pode indicar que o SDK espera um formato específico de URL.
    4. Erros comuns: typos, URL de Hosting/Project ID em vez de Database URL, "https://" ausente, sufixo incorreto (.firebasedatabase.app vs .firebaseio.com).
    5. Se a URL do seu console Firebase é, por exemplo, "https://projeto.regiao.firebasedatabase.app", mas o erro do SDK menciona ".firebaseio.com", o SDK pode esperar o formato mais antigo.
    Priorize o formato sugerido pela mensagem de erro do SDK ou documentação oficial.
    Garanta que a variável está disponível para os ambientes corretos da Vercel. Redeploy após corrigir.
    --------------------------------------------------------------------------------------
    `;
    console.error(detailedErrorMessageForGetDatabase);
    throw new Error(
      `A configuração do Firebase Database falhou em getDatabase() devido a NEXT_PUBLIC_FIREBASE_DATABASE_URL inválida (URL efetiva: '${finalEffectiveDbURL}'). Erro SDK: ${error.message}. ` +
      `AÇÃO: Verifique 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' nas config. da Vercel e os LOGS COMPLETOS DO SERVIDOR para detalhes.`
      );
}

// Exporte os serviços Firebase que você precisa
export { app, db /*, auth, firestore, storage */ };
    