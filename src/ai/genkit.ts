import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Log an error if GEMINI_API_KEY is not set, which is crucial for Vercel deployment.
if (!process.env.GEMINI_API_KEY) {
  console.error(
    'CRITICAL_ERROR: GEMINI_API_KEY environment variable is not set. AI features will not work. Please set this in your Vercel project environment variables.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-2.0-flash',
});
