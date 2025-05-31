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
    'CRITICAL_CONFIG_ERROR: The NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable is not set. Firebase Realtime Database will not work. Please ensure this variable is correctly set in your Vercel project environment variables.'
  );
} else if (!dbURL.startsWith('https://') || !dbURL.endsWith('.firebaseio.com')) {
  // This check is based on the specific error message "Please use https://<YOUR FIREBASE>.firebaseio.com"
  // Some newer projects might use a URL ending in .firebasedatabase.app.
  // If your Firebase console provides such a URL and you still get parsing errors,
  // the issue might be more complex, but this check aligns with the SDK's reported expectation.
  console.warn(
    `POTENTIAL_CONFIG_ISSUE: The NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") does not strictly match the 'https://<YOUR-PROJECT-ID>.firebaseio.com' format suggested by a Firebase error. If you continue to see "Cannot parse Firebase url" errors, please double-check this URL in your Firebase console and Vercel environment variables. Ensure it includes 'https://' and the correct domain.`
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: dbURL, // Use the checked (or original, if check passes/warns) URL
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// Inicializa o Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Database = getDatabase(app);
// const auth = getAuth(app); // Descomente se for usar autenticação
// const firestore = getFirestore(app); // Descomente se for usar Firestore
// const storage = getStorage(app); // Descomente se for usar Storage

// Exporte os serviços Firebase que você precisa
export { app, db /*, auth, firestore, storage */ };

// Funções de serviço de exemplo (a serem expandidas)

// Exemplo de como pegar um produto
// export async function getProductById(productId: string) {
//   const productRef = ref(db, `products/${productId}`);
//   const snapshot = await get(productRef);
//   if (snapshot.exists()) {
//     return snapshot.val();
//   } else {
//     console.log("No data available for product:", productId);
//     return null;
//   }
// }

// Exemplo de como salvar/atualizar um produto
// export async function saveProduct(productId: string, productData: any) {
//   const productRef = ref(db, `products/${productId}`);
//   try {
//     await set(productRef, {
//       ...productData,
//       updatedAt: serverTimestamp(), // Idealmente usar serverTimestamp
//     });
//     console.log("Product saved successfully:", productId);
//   } catch (error) {
//     console.error("Error saving product:", productId, error);
//   }
// }
