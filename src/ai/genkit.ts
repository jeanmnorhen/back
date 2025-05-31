
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Log an error if GEMINI_API_KEY is not set, which is crucial for Vercel deployment.
if (!process.env.GEMINI_API_KEY) {
  const errorMessage = 'CRITICAL_ERROR: GEMINI_API_KEY environment variable is not set. AI features will not work. Please set this in your Vercel project environment variables.';
  console.error(errorMessage);
  // Throw an error to make this explicitly fail on the server and be visible in Vercel logs.
  throw new Error(errorMessage);
}

// Log errors for critical Firebase environment variables if not set for Vercel deployment.
// These are also checked in src/lib/firebase.ts, but an early check here can be helpful
// if AI flows attempt to use Firebase tools before the main app fully initializes Firebase.
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error(
    'CRITICAL_ERROR (from genkit.ts): NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set. Firebase features (potentially used by AI tools) may not work. Please set this in your Vercel project environment variables.'
  );
  // Consider throwing an error here too if AI tools *always* require Firebase.
}
if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
  console.error(
    'CRITICAL_ERROR (from genkit.ts): NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable is not set. Firebase Realtime Database (potentially used by AI tools) will not work. Please set this in your Vercel project environment variables.'
  );
  // Consider throwing an error here too.
}


export const ai = genkit({
  plugins: [
    googleAI(), // This initialization will likely fail if GEMINI_API_KEY is missing,
                // but the explicit throw above makes it clearer.
  ],
  model: 'googleai/gemini-2.0-flash',
});
