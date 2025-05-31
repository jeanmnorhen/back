
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
// import { getAuth } from "firebase/auth"; // Descomente se for usar autenticação
// import { getFirestore } from "firebase/firestore"; // Descomente se for usar Firestore
// import { getStorage } from "firebase/storage"; // Descomente se for usar Storage

const dbURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

// Pre-check the databaseURL format to provide a more specific error message.
if (!dbURL) {
  console.error(
    'CRITICAL_CONFIG_ERROR: The NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable is NOT SET. Firebase Realtime Database will not work. Please set this variable in your Vercel project environment variables. It should look like "https://<YOUR-PROJECT-ID>.firebaseio.com" or "https://<YOUR-PROJECT-ID>-default-rtdb.<region>.firebasedatabase.app".'
  );
} else if (!dbURL.startsWith('https://')) {
  console.error(
    `CRITICAL_CONFIG_ERROR: The NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") MUST start with "https://". Please correct this in your Vercel project environment variables.`
  );
} else if (!dbURL.endsWith('.firebaseio.com')) {
  // Este aviso está alinhado com a mensagem de erro específica do Firebase.
  // Embora URLs '.firebasedatabase.app' sejam comuns para projetos mais novos,
  // a mensagem de erro "Please use https://<YOUR FIREBASE>.firebaseio.com"
  // sugere que, para sua versão atual do SDK do Firebase ou configuração de projeto,
  // este formato '.firebaseio.com' pode ser estritamente necessário, ou o URL fornecido
  // está malformado de outra forma e o SDK sugere este formato como correção.
  console.warn(
    `POTENTIAL_CONFIG_WARNING: The NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") does not end with '.firebaseio.com'. The Firebase SDK reported a fatal error: "Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com". Isso sugere FORTEMENTE que seu URL deve terminar com '.firebaseio.com' ou está malformado. Por favor, VERIFIQUE CUIDADOSAMENTE este URL no console do Firebase e nas variáveis de ambiente da Vercel. Garanta que é o URL completo e correto do Realtime Database.`
  );
}

// Se o erro fatal "Cannot parse Firebase url" persistir após verificar o acima:
// 1. Verifique novamente se NEXT_PUBLIC_FIREBASE_DATABASE_URL foi copiado corretamente do Console do Firebase (seção Realtime Database).
// 2. Certifique-se de que não há erros de digitação ou caracteres extras.
// 3. Se o seu projeto Firebase for mais recente, ele pode fornecer um URL como 'https://<project-id>-default-rtdb.<region>.firebasedatabase.app'.
//    Se você estiver usando tal URL e ainda receber o erro sobre '.firebaseio.com', pode haver uma incompatibilidade
//    ou um problema mais profundo com a análise do SDK em seu ambiente.
//    No entanto, a mensagem de erro do Firebase é o guia principal aqui.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: dbURL, // Usar o URL verificado (ou original, se a verificação passar/avisar)
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// Inicializa o Firebase
let app: FirebaseApp;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("FIREBASE_INIT_ERROR: Erro durante a inicialização do aplicativo Firebase. Isso frequentemente está relacionado a um 'databaseURL' inválido. URL fornecido:", dbURL, "Configuração completa:", firebaseConfig, "Erro original:", error);
    // Re-lançar o erro para que seja visível e interrompa se necessário.
    throw error;
  }
} else {
  app = getApp();
}

const db: Database = getDatabase(app);
// const auth = getAuth(app); // Descomente se for usar autenticação
// const firestore = getFirestore(app); // Descomente se for usar Firestore
// const storage = getStorage(app); // Descomente se for usar Storage

// Exporte os serviços Firebase que você precisa
export { app, db /*, auth, firestore, storage */ };
