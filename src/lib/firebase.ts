
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
// import { getAuth } from "firebase/auth"; // Descomente se for usar autenticação
// import { getFirestore } from "firebase/firestore"; // Descomente se for usar Firestore
// import { getStorage } from "firebase/storage"; // Descomente se for usar Storage

// Log all NEXT_PUBLIC_FIREBASE_ prefixed environment variables for diagnostics
console.log("--------------------------------------------------------------------------------------");
console.log("[Firebase Setup] Iniciando Diagnóstico de Variáveis de Ambiente Firebase...");
console.log("--------------------------------------------------------------------------------------");
let foundFirebaseVars = false;
for (const key in process.env) {
  if (key.startsWith("NEXT_PUBLIC_FIREBASE_")) {
    console.log(`[Firebase Setup] Variável de Ambiente Encontrada: ${key} = "${process.env[key]}"`);
    foundFirebaseVars = true;
  }
}
if (!foundFirebaseVars) {
  console.log("[Firebase Setup] NENHUMA variável de ambiente com prefixo NEXT_PUBLIC_FIREBASE_ foi encontrada em process.env.");
}
console.log("--------------------------------------------------------------------------------------");
console.log("[Firebase Setup] --- Fim do Diagnóstico de Variáveis de Ambiente Firebase ---");
console.log("--------------------------------------------------------------------------------------");


const rawDbURLFromEnv = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
console.log("[Firebase Setup] Valor bruto de NEXT_PUBLIC_FIREBASE_DATABASE_URL do ambiente (não deve estar vazio ou indefinido):", `"${rawDbURLFromEnv}"`);

const dbURL = rawDbURLFromEnv;

// Adicionando um log extra para máxima clareza sobre o valor que está sendo testado:
console.log(`[Firebase Setup] DIAGNOSTIC: VALOR SENDO VERIFICADO PARA dbURL (derivado de NEXT_PUBLIC_FIREBASE_DATABASE_URL): "${dbURL}"`);

if (typeof dbURL !== 'string' || !dbURL.startsWith('https://')) {
  const detailedErrorMessage = `
    --------------------------------------------------------------------------------------
    ERRO CRÍTICO DE CONFIGURAÇÃO DO FIREBASE - INTERRUPÇÃO IMEDIATA
    --------------------------------------------------------------------------------------
    A variável de ambiente NEXT_PUBLIC_FIREBASE_DATABASE_URL NÃO ESTÁ CONFIGURADA, está vazia, ou não começa com "https://".
    Valor recebido do ambiente para NEXT_PUBLIC_FIREBASE_DATABASE_URL: "${dbURL}" (Se estiver em branco, não está configurada, está vazia ou não está acessível pela aplicação)

    O Firebase Realtime Database NÃO FUNCIONARÁ sem uma URL válida.

    >>> AÇÃO IMEDIATA NECESSÁRIA NAS CONFIGURAÇÕES DO SEU PROJETO VERCEL <<<
    1. ACESSE O PAINEL DO SEU PROJETO NA VERCEL.
    2. Navegue até a aba "Settings" do seu projeto.
    3. Clique em "Environment Variables" na barra lateral.
    4. VERIFIQUE O SEGUINTE PARA A VARIÁVEL CHAMADA 'NEXT_PUBLIC_FIREBASE_DATABASE_URL':
        a. EXISTÊNCIA: Certifique-se de que a variável 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' realmente existe.
        b. GRAFIA: Verifique novamente se há erros de digitação no NOME da variável. Deve ser EXATAMENTE "NEXT_PUBLIC_FIREBASE_DATABASE_URL".
        c. VALOR: Certifique-se de que o VALOR é o URL HTTPS correto e completo do seu Firebase Realtime Database.
           - Exemplo para projetos Firebase mais antigos ou regiões específicas: "https://seu-projeto-id-default-rtdb.firebaseio.com"
           - Exemplo para projetos Firebase mais recentes ou regiões diferentes: "https://seu-projeto-id-default-rtdb.sua-regiao.firebasedatabase.app"
           - Copie esta URL diretamente da seção Realtime Database do seu Projeto Firebase.
        d. ESCOPO: Certifique-se de que a variável está disponível para todos os ambientes necessários (Production, Preview e Development).
        e. SEM CARACTERES EXTRAS: Certifique-se de que não há espaços no início/fim ou caracteres invisíveis no valor da variável.
    5. Após corrigir quaisquer problemas, você DEVE FAZER UM NOVO DEPLOY da sua aplicação na Vercel (uma nova implantação, não apenas uma reinicialização) para que as alterações entrem em vigor.
    --------------------------------------------------------------------------------------
  `;
  console.error(detailedErrorMessage); // This is the detailed log that appears in Vercel's server console.
  // The error message thrown to the application is now more direct.
  throw new Error(
    `Firebase setup halted. CRITICAL: The NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable is missing, empty, or invalid in your Vercel deployment (received: "${dbURL}"). ` +
    `ACTION REQUIRED: 1. Go to your Vercel Project Settings -> Environment Variables. ` +
    `2. Ensure 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' is correctly set to your Firebase Realtime Database URL (e.g., 'https://your-project.firebaseio.com' or 'https://your-project.region.firebasedatabase.app'). ` +
    `3. Ensure it's available to the correct Vercel environment (Production, Preview, Development). ` +
    `4. Redeploy your application on Vercel after making changes. ` +
    `For more detailed diagnostic steps, check the FULL SERVER CONSOLE LOGS on Vercel.`
  );
}

// Outras verificações para problemas comuns, registradas como avisos se a URL for estruturalmente plausível
if (dbURL && !dbURL.endsWith('.firebaseio.com') && !dbURL.endsWith('.firebasedatabase.app')) {
  console.warn(
    `[Firebase Setup] POTENCIAL_INCOMPATIBILIDADE_DE_CONFIG: Sua NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") NÃO termina com '.firebaseio.com' ou '.firebasedatabase.app'. 
    Embora isso possa ser válido para algumas configurações mais novas do Firebase ou regiões específicas, se você encontrar erros "Cannot parse Firebase url" do SDK
    que mencionam especificamente um formato particular (por exemplo, ".firebaseio.com"), pode ser necessário garantir que sua URL corresponda a esse formato.
    Verifique no seu console do Firebase o URL exato do Realtime Database.`
  );
}


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: dbURL, 
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// Inicializa o Firebase
let app: FirebaseApp;
if (!getApps().length) {
  try {
    console.log("[Firebase Setup] Tentando inicializar o app Firebase com a configuração (chave de API omitida):", { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? "[OMITIDA]" : undefined, databaseURL: dbURL });
    app = initializeApp(firebaseConfig);
    console.log("[Firebase Setup] App Firebase inicializado com sucesso.");
  } catch (error: any) {
    console.error(`[Firebase Setup] FIREBASE_INIT_APP_ERROR: Erro durante a inicialização do app Firebase. Isso pode ocorrer se outros valores de configuração (como projectId) também estiverem incorretos ou ausentes. URL fornecida para a configuração: "${firebaseConfig.databaseURL}". Erro original:`, error.message, error.stack);
    // Fornece um erro mais amigável que orienta o usuário.
    throw new Error(
      `A inicialização do app Firebase falhou. Isso pode ser devido a problemas com NEXT_PUBLIC_FIREBASE_PROJECT_ID ou outras variáveis de configuração do Firebase na Vercel. A databaseURL usada foi "${firebaseConfig.databaseURL}". Erro original: ${error.message}. ` +
      `Por favor, verifique todas as variáveis de ambiente NEXT_PUBLIC_FIREBASE_* nas configurações do seu projeto Vercel e verifique os logs do servidor para detalhes.`
      );
  }
} else {
  app = getApp();
  console.log("[Firebase Setup] Usando instância existente do app Firebase.");
}

let db: Database;
try {
  const effectiveDbURLFromApp = app.options.databaseURL;
  console.log("[Firebase Setup] Tentando obter instância do Database. databaseURL efetiva das opções do app Firebase:", effectiveDbURLFromApp);

  if (!effectiveDbURLFromApp || typeof effectiveDbURLFromApp !== 'string' || !effectiveDbURLFromApp.startsWith('https://') ) {
      const configErrorMsg = `[Firebase Setup] FIREBASE_GET_DATABASE_PRE_CHECK_ERROR: A databaseURL efetiva ('${effectiveDbURLFromApp}') da instância do app Firebase inicializada é inválida ou está ausente. Esta URL é derivada da variável de ambiente NEXT_PUBLIC_FIREBASE_DATABASE_URL. Por favor, certifique-se de que está configurada corretamente na Vercel. O formato esperado geralmente começa com "https://" e frequentemente termina com ".firebaseio.com" ou ".firebasedatabase.app". O erro do SDK do Firebase fornecerá a orientação mais específica.`;
      console.error(configErrorMsg);
      throw new Error(configErrorMsg); 
  }
  
  db = getDatabase(app); 
  console.log("[Firebase Setup] Instância do Firebase Database obtida com sucesso.");
} catch (error: any) {
   const finalEffectiveDbURL = app.options.databaseURL; 
   const detailedErrorMessageForGetDatabase = `
    --------------------------------------------------------------------------------------
    FALHA CRÍTICA NA INICIALIZAÇÃO DO BANCO DE DADOS FIREBASE (DURANTE GET_DATABASE)
    (Provavelmente devido a um formato ou valor incorreto de NEXT_PUBLIC_FIREBASE_DATABASE_URL nas configurações de ambiente da Vercel, ou uma incompatibilidade do SDK com o formato de URL fornecido)
    --------------------------------------------------------------------------------------
    Falha ao obter instância do Firebase Database usando getDatabase(app).
    O SDK do Firebase lançou um erro: "${error.message}" (Código: ${error.code || 'N/A'})
    Este erro quase sempre significa que a 'databaseURL' que o SDK está tentando usar está incorreta, malformada ou inacessível.
    
    databaseURL efetiva usada pela instância do app Firebase durante esta tentativa: '${finalEffectiveDbURL}'
    Esta URL foi derivada da variável de ambiente NEXT_PUBLIC_FIREBASE_DATABASE_URL (Valor inicial registrado como: '${rawDbURLFromEnv}').

    >>> PASSOS PARA SOLUÇÃO DE PROBLEMAS (VERIFIQUE NOVAMENTE AS VARIÁVEIS DE AMBIENTE DA VERCEL): <<<
    1. REVEJA COM MUITO CUIDADO o valor de NEXT_PUBLIC_FIREBASE_DATABASE_URL nas "Settings" -> "Environment Variables" do seu projeto Vercel.
    2. Certifique-se de que foi copiado EXATAMENTE da seção Realtime Database do seu projeto Firebase no Console do Firebase.
    3. A própria mensagem de erro do Firebase (como "Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com") é UMA PISTA FORTE. Pode indicar que o formato da URL DEVE corresponder a esse padrão específico para sua versão/região do SDK, mesmo que seu console mostre uma URL ligeiramente diferente.
    4. Erros comuns:
        - Erros de digitação ou espaços/caracteres extras no NOME ou VALOR da variável.
        - Usar a URL do ID do projeto (project.firebaseapp.com) ou URL do Hosting em vez da URL do REALTIME DATABASE.
        - Prefixo "https://" ausente.
        - Usar um sufixo incorreto (por exemplo, ".firebasedatabase.app" quando o SDK espera ".firebaseio.com" devido à sua lógica interna de análise ou configuração regional).

    Se a URL do seu console do Firebase for, por exemplo, "https://projeto.regiao.firebasedatabase.app", mas o erro do SDK mencionar *especificamente* ".firebaseio.com", 
    o analisador interno do SDK pode estar esperando o formato mais antigo. Priorize o formato sugerido pela mensagem de erro do SDK ou pela documentação oficial do Firebase para sua versão do SDK.
    Certifique-se de que a variável está disponível para os ambientes corretos da Vercel (Production, Preview, Development).
    Um novo deploy é necessário após alterar as variáveis de ambiente na Vercel.
    --------------------------------------------------------------------------------------
    `;
    console.error(detailedErrorMessageForGetDatabase); 
    throw new Error(
      `A configuração do Firebase Database falhou devido a NEXT_PUBLIC_FIREBASE_DATABASE_URL inválida (URL efetiva usada pelo SDK: '${finalEffectiveDbURL}'). Erro do SDK Firebase: ${error.message}. ` +
      `AÇÃO NECESSÁRIA: 1. Vá para as Configurações do seu Projeto Vercel -> Variáveis de Ambiente. ` +
      `2. Certifique-se de que 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' está configurada corretamente. ` +
      `3. VERIFIQUE OS LOGS COMPLETOS DO CONSOLE DO SERVIDOR na Vercel para INSTRUÇÕES DETALHADAS. ` +
      `4. Faça um novo deploy após corrigir.`
      );
}

// Exporte os serviços Firebase que você precisa
export { app, db /*, auth, firestore, storage */ };
    
