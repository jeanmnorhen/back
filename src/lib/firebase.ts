// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
// import { getAuth } from "firebase/auth"; // Descomente se for usar autenticação
// import { getFirestore } from "firebase/firestore"; // Descomente se for usar Firestore
// import { getStorage } from "firebase/storage"; // Descomente se for usar Storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
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
