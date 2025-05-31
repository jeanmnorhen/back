
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
// import { getAuth } from "firebase/auth"; // Descomente se for usar autenticação
// import { getFirestore } from "firebase/firestore"; // Descomente se for usar Firestore
// import { getStorage } from "firebase/storage"; // Descomente se for usar Storage

const rawDbURLFromEnv = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
console.log("[Firebase Setup] Raw NEXT_PUBLIC_FIREBASE_DATABASE_URL from environment (should not be empty or undefined):", `"${rawDbURLFromEnv}"`);

const dbURL = rawDbURLFromEnv;

if (typeof dbURL !== 'string' || !dbURL.startsWith('https://')) {
  const detailedErrorMessage = `
    --------------------------------------------------------------------------------------
    CRITICAL FIREBASE CONFIGURATION ERROR - IMMEDIATE HALT
    --------------------------------------------------------------------------------------
    The NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable is either NOT SET, empty, or does not start with "https://".
    Value received from environment for NEXT_PUBLIC_FIREBASE_DATABASE_URL: "${dbURL}" (If blank, it's not set, empty, or not accessible by the application)

    Firebase Realtime Database WILL NOT WORK without a valid URL.

    >>> IMMEDIATE ACTION REQUIRED IN YOUR VERCEL PROJECT SETTINGS <<<
    1. GO TO YOUR VERCEL PROJECT DASHBOARD.
    2. Navigate to the "Settings" tab for your project.
    3. Click on "Environment Variables" in the sidebar.
    4. VERIFY THE FOLLOWING FOR THE VARIABLE NAMED 'NEXT_PUBLIC_FIREBASE_DATABASE_URL':
        a. EXISTENCE: Ensure the variable 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' actually exists.
        b. SPELLING: Double-check for typos in the variable NAME. It must be EXACTLY "NEXT_PUBLIC_FIREBASE_DATABASE_URL".
        c. VALUE: Ensure the VALUE is the correct and complete HTTPS URL of your Firebase Realtime Database.
           - Example for older Firebase projects or specific regions: "https://your-project-id-default-rtdb.firebaseio.com"
           - Example for newer Firebase projects or different regions: "https://your-project-id-default-rtdb.your-region.firebasedatabase.app"
           - Copy this URL directly from your Firebase Project > Realtime Database section.
        d. SCOPE: Ensure the variable is available to all necessary environments (Production, Preview, and Development).
        e. NO EXTRA CHARACTERS: Ensure there are no leading/trailing spaces or invisible characters in the variable's value.
    5. After correcting any issues, you MUST redeploy your application on Vercel (a new deployment, not just a restart) for the changes to take effect.
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

// Further checks for common issues, logged as warnings if the URL is otherwise structurally plausible
if (dbURL && !dbURL.endsWith('.firebaseio.com') && !dbURL.endsWith('.firebasedatabase.app')) {
  console.warn(
    `[Firebase Setup] POTENTIAL_CONFIG_MISMATCH: Your NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${dbURL}") does NOT end with '.firebaseio.com' or '.firebasedatabase.app'. 
    While this might be valid for some newer Firebase setups or specific regions, if you encounter "Cannot parse Firebase url" errors from the SDK
    that specifically mention a particular format (e.g., ".firebaseio.com"), you may need to ensure your URL matches that format.
    Check your Firebase console for the exact Realtime Database URL.`
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
    console.log("[Firebase Setup] Attempting to initialize Firebase app with config (API key redacted):", { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? "[REDACTED]" : undefined, databaseURL: dbURL });
    app = initializeApp(firebaseConfig);
    console.log("[Firebase Setup] Firebase app initialized successfully.");
  } catch (error: any) {
    console.error(`[Firebase Setup] FIREBASE_INIT_APP_ERROR: Error during Firebase app initialization. This can occur if other config values (like projectId) are also incorrect or missing. URL provided to config: "${firebaseConfig.databaseURL}". Original error:`, error.message, error.stack);
    // Provide a more user-friendly error that guides them.
    throw new Error(
      `Firebase app initialization failed. This might be due to issues with NEXT_PUBLIC_FIREBASE_PROJECT_ID or other Firebase config variables in Vercel. The databaseURL used was "${firebaseConfig.databaseURL}". Original error: ${error.message}. ` +
      `Please verify all NEXT_PUBLIC_FIREBASE_* environment variables in your Vercel project settings and check server logs for details.`
      );
  }
} else {
  app = getApp();
  console.log("[Firebase Setup] Using existing Firebase app instance.");
}

let db: Database;
try {
  const effectiveDbURLFromApp = app.options.databaseURL;
  console.log("[Firebase Setup] Attempting to get Database instance. Effective databaseURL from Firebase app options:", effectiveDbURLFromApp);

  if (!effectiveDbURLFromApp || typeof effectiveDbURLFromApp !== 'string' || !effectiveDbURLFromApp.startsWith('https://') ) {
      const configErrorMsg = `[Firebase Setup] FIREBASE_GET_DATABASE_PRE_CHECK_ERROR: The effective databaseURL ('${effectiveDbURLFromApp}') from the initialized Firebase app instance is invalid or missing. This URL is derived from the NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable. Please ensure it's correctly set in Vercel. Expected format usually starts with "https://" and often ends with ".firebaseio.com" or ".firebasedatabase.app". The Firebase SDK error will provide the most specific guidance.`;
      console.error(configErrorMsg);
      throw new Error(configErrorMsg); 
  }
  
  db = getDatabase(app); 
  console.log("[Firebase Setup] Successfully got Firebase Database instance.");
} catch (error: any) {
   const finalEffectiveDbURL = app.options.databaseURL; 
   const detailedErrorMessageForGetDatabase = `
    --------------------------------------------------------------------------------------
    CRITICAL FIREBASE DATABASE INITIALIZATION FAILURE (DURING GET_DATABASE)
    (Likely due to an incorrect NEXT_PUBLIC_FIREBASE_DATABASE_URL format or value in your Vercel environment settings, or an SDK incompatibility with the provided URL format)
    --------------------------------------------------------------------------------------
    Failed to get Firebase Database instance using getDatabase(app).
    The Firebase SDK threw an error: "${error.message}" (Code: ${error.code || 'N/A'})
    This error almost always means the 'databaseURL' that the SDK is attempting to use is incorrect, malformed, or inaccessible.
    
    Effective databaseURL used by the Firebase app instance during this attempt: '${finalEffectiveDbURL}'
    This URL was derived from the NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable (Initial value logged as: '${rawDbURLFromEnv}').

    >>> TROUBLESHOOTING STEPS (RE-CHECK VERCEL ENVIRONMENT VARIABLES): <<<
    1. VERY CAREFULLY RE-CHECK the NEXT_PUBLIC_FIREBASE_DATABASE_URL value in your Vercel project's "Settings" -> "Environment Variables".
    2. Ensure it's copied EXACTLY from your Firebase project's Realtime Database section in the Firebase Console.
    3. The Firebase error message itself (like "Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com") is a STRONG HINT. It may indicate the URL format MUST match that specific pattern for your SDK version/region, even if your console shows a slightly different URL.
    4. Common mistakes:
        - Typos or extra spaces/characters in the variable NAME or VALUE.
        - Using the project ID URL (project.firebaseapp.com) or Hosting URL instead of the REALTIME DATABASE URL.
        - Missing "https://" prefix.
        - Using an incorrect suffix (e.g., ".firebasedatabase.app" when the SDK expects ".firebaseio.com" due to its internal parsing logic or regional configuration).

    If the URL from your Firebase console is, for example, "https://project.region.firebasedatabase.app", but the SDK error *specifically* mentions ".firebaseio.com", 
    the SDK's internal parser might be expecting the older format. Prioritize the format suggested by the SDK error message or official Firebase documentation for your SDK version.
    Ensure the variable is available to the correct Vercel environments (Production, Preview, Development).
    A redeployment is necessary after changing environment variables in Vercel.
    --------------------------------------------------------------------------------------
    `;
    console.error(detailedErrorMessageForGetDatabase); 
    throw new Error(
      `Firebase Database setup failed due to invalid NEXT_PUBLIC_FIREBASE_DATABASE_URL (effective URL used by SDK: '${finalEffectiveDbURL}'). Firebase SDK Error: ${error.message}. ` +
      `ACTION REQUIRED: 1. Go to your Vercel Project Settings -> Environment Variables. ` +
      `2. Ensure 'NEXT_PUBLIC_FIREBASE_DATABASE_URL' is correctly set. ` +
      `3. CHECK THE FULL SERVER CONSOLE LOGS on Vercel for DETAILED INSTRUCTIONS. ` +
      `4. Redeploy after fixing.`
      );
}

// Exporte os serviços Firebase que você precisa
export { app, db /*, auth, firestore, storage */ };
    
