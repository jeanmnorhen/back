
'use server';

/**
 * @fileOverview An object identification AI agent that also translates identified objects.
 *
 * - identifyObjects - A function that handles the object identification and translation process.
 * - IdentifyObjectsInput - The input type for the identifyObjects function.
 * - IdentifyObjectsOutput - The return type for the identifyObjects function.
 * - TranslatedObjectType - The type for an object with its translations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyObjectsInput = z.infer<typeof IdentifyObjectsInputSchema>;

const _TranslatedObjectSchema = z.object({
  original: z.string().describe('The object name in the original language (likely English).'),
  translations: z.object({
    es: z.string().optional().describe('Translation to Spanish.'),
    fr: z.string().optional().describe('Translation to French.'),
    de: z.string().optional().describe('Translation to German.'),
    zh: z.string().optional().describe('Translation to Chinese (Simplified).'),
    ja: z.string().optional().describe('Translation to Japanese.'),
  }).describe('An object where keys are language codes (e.g., "es", "fr") and values are the translated object names. Properties are optional if a translation is not available.'),
});
export type TranslatedObjectType = z.infer<typeof _TranslatedObjectSchema>;

const _IdentifyObjectsOutputSchema = z.object({
  identifiedItems: z.array(_TranslatedObjectSchema).describe('A list of identified objects, each with its original name and translations.'),
});
export type IdentifyObjectsOutput = z.infer<typeof _IdentifyObjectsOutputSchema>;


// Prompt to identify objects in the image (returns English names)
const identifyObjectsPrompt = ai.definePrompt({
  name: 'identifyObjectsPrompt',
  input: {schema: IdentifyObjectsInputSchema},
  output: {schema: z.object({ objects: z.array(z.string()).describe('The objects identified in the image, in English.') })},
  prompt: `You are an expert in computer vision. You will identify the objects in the image.
Return a list of object names in English.

Use the following image as the primary source of information.
Image: {{media url=photoDataUri}}

List the objects identified in the image. Respond with a JSON object containing a single key "objects", which is an array of strings.
Example: {"objects": ["cat", "table", "plant"]}`,
});

// Prompt to translate a list of object names
const BatchTranslateObjectsInputSchema = z.object({
  objectNames: z.array(z.string()).describe('A list of object names in English.'),
  languageCodes: z.array(z.string()).describe('A list of ISO 639-1 language codes to translate to.'),
});
const BatchTranslateObjectsOutputSchema = z.array(_TranslatedObjectSchema);

const batchTranslateObjectsPrompt = ai.definePrompt({
  name: 'batchTranslateObjectsPrompt',
  input: {schema: BatchTranslateObjectsInputSchema},
  output: {schema: BatchTranslateObjectsOutputSchema},
  prompt: `You are an expert multilingual translator.
Your task is to translate a list of object names from English into a specified list of target languages.

Input Object Names (English):
{{#each objectNames}}
- {{{this}}}
{{/each}}

Target Language Codes: {{#each languageCodes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
(Language codes example: "es" for Spanish, "fr" for French, "de" for German, "zh" for Chinese Simplified, "ja" for Japanese)

Please provide the output as a JSON array. Each object in the array should correspond to an original English object name and must contain:
1. An "original" field: a string with the original English object name.
2. A "translations" field: an object where keys are the target language codes (e.g., "es", "fr", "de", "zh", "ja") and values are the translated names in those languages.

Example:
If Input Object Names are ["cat", "dog"] and Target Language Codes are ["es", "fr"], the output should be:
[
  {
    "original": "cat",
    "translations": {
      "es": "gato",
      "fr": "chat"
    }
  },
  {
    "original": "dog",
    "translations": {
      "es": "perro",
      "fr": "chien"
    }
  }
]

If a translation for a specific language cannot be found or is not applicable, you may omit that language key from the "translations" object for that item, or provide the original English word if no better translation exists.
Ensure the JSON is well-formed.`,
});


export async function identifyObjects(input: IdentifyObjectsInput): Promise<IdentifyObjectsOutput> {
  return identifyObjectsFlow(input);
}

const identifyObjectsFlow = ai.defineFlow(
  {
    name: 'identifyObjectsFlow',
    inputSchema: IdentifyObjectsInputSchema,
    outputSchema: _IdentifyObjectsOutputSchema,
  },
  async (input) => {
    // Step 1: Identify objects in English
    const {output: visionOutput} = await identifyObjectsPrompt(input);
    if (!visionOutput || !visionOutput.objects || visionOutput.objects.length === 0) {
      return { identifiedItems: [] };
    }
    const englishObjectNames = visionOutput.objects;

    // Step 2: Translate the identified object names
    const targetLanguageCodes = ['es', 'fr', 'de', 'zh', 'ja']; // Spanish, French, German, Chinese (Simplified), Japanese
    
    const {output: translationOutput} = await batchTranslateObjectsPrompt({
      objectNames: englishObjectNames,
      languageCodes: targetLanguageCodes,
    });

    if (!translationOutput) {
        // Fallback: if translation fails, return original objects without translations
        const emptyTranslations: TranslatedObjectType['translations'] = {};
        if (targetLanguageCodes.includes('es')) emptyTranslations.es = undefined;
        if (targetLanguageCodes.includes('fr')) emptyTranslations.fr = undefined;
        if (targetLanguageCodes.includes('de')) emptyTranslations.de = undefined;
        if (targetLanguageCodes.includes('zh')) emptyTranslations.zh = undefined;
        if (targetLanguageCodes.includes('ja')) emptyTranslations.ja = undefined;

        return { 
            identifiedItems: englishObjectNames.map(name => ({
                original: name,
                translations: emptyTranslations 
            }))
        };
    }
    
    const finalItems: TranslatedObjectType[] = englishObjectNames.map(originalName => {
        const translatedItem = translationOutput.find(tItem => tItem.original === originalName);
        if (translatedItem) {
            return translatedItem;
        }
        const emptyTranslationsForSingle: TranslatedObjectType['translations'] = {};
        if (targetLanguageCodes.includes('es')) emptyTranslationsForSingle.es = undefined;
        if (targetLanguageCodes.includes('fr')) emptyTranslationsForSingle.fr = undefined;
        if (targetLanguageCodes.includes('de')) emptyTranslationsForSingle.de = undefined;
        if (targetLanguageCodes.includes('zh')) emptyTranslationsForSingle.zh = undefined;
        if (targetLanguageCodes.includes('ja')) emptyTranslationsForSingle.ja = undefined;
        return { original: originalName, translations: emptyTranslationsForSingle }; 
    });


    return { identifiedItems: finalItems };
  }
);

