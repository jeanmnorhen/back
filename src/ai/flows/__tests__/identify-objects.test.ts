import { identifyObjects, type IdentifyObjectsInput, type IdentifyObjectsOutput } from '../identify-objects';
import { ai } from '@/ai/genkit';

// Mock the genkit ai module
// We only want to mock defineFlow and definePrompt for testing the flow's logic
jest.mock('@/ai/genkit', () => {
  const actualGenkitAI = jest.requireActual('@/ai/genkit').ai;
  return {
    ai: {
      ...actualGenkitAI, // Spread any other ai properties
      defineFlow: jest.fn((config, flowFunc) => flowFunc), // Make defineFlow return the actual flow function
      definePrompt: jest.fn(), // This will be configured per test case
    },
  };
});

describe('identifyObjects Flow', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (ai.definePrompt as jest.Mock).mockClear();
  });

  it('should identify objects and translate them successfully', async () => {
    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string }) => {
      if (promptConfig.name === 'identifyObjectsPrompt') {
        return jest.fn(async (input: any) => ({
          output: { objects: ['cat', 'dog'] },
        }));
      }
      if (promptConfig.name === 'batchTranslateObjectsPrompt') {
        return jest.fn(async (input: { objectNames: string[] }) => ({
          output: input.objectNames.map(name => ({
            original: name,
            translations: { es: `${name}-es`, fr: `${name}-fr`, de: `${name}-de`, zh: `${name}-zh`, ja: `${name}-ja` },
          })),
        }));
      }
      return jest.fn(async () => ({ output: null })); // Default fallback
    });

    const input: IdentifyObjectsInput = { photoDataUri: 'data:image/jpeg;base64,testdata' };
    const result: IdentifyObjectsOutput = await identifyObjects(input);

    expect(result.identifiedItems).toHaveLength(2);
    expect(result.identifiedItems[0].original).toBe('cat');
    expect(result.identifiedItems[0].translations.es).toBe('cat-es');
    expect(result.identifiedItems[1].original).toBe('dog');
    expect(result.identifiedItems[1].translations.ja).toBe('dog-ja');

    expect(ai.definePrompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'identifyObjectsPrompt' }));
    expect(ai.definePrompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'batchTranslateObjectsPrompt' }));
  });

  it('should return empty identifiedItems if vision API returns no objects', async () => {
    let batchTranslatePromptMockFn: jest.Mock | undefined;

    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string }) => {
      if (promptConfig.name === 'identifyObjectsPrompt') {
        return jest.fn(async (input: any) => ({
          output: { objects: [] }, 
        }));
      }
      if (promptConfig.name === 'batchTranslateObjectsPrompt') {
        batchTranslatePromptMockFn = jest.fn(async (input: any) => ({
          output: [], // Should not matter as it shouldn't be called
        }));
        return batchTranslatePromptMockFn;
      }
      return jest.fn(async () => ({ output: null }));
    });

    const input: IdentifyObjectsInput = { photoDataUri: 'data:image/jpeg;base64,emptytest' };
    const result: IdentifyObjectsOutput = await identifyObjects(input);

    expect(result.identifiedItems).toEqual([]);
    expect(ai.definePrompt).toHaveBeenCalledWith(expect.objectContaining({ name: 'identifyObjectsPrompt' }));
    
    // Check if the batchTranslateObjectsPrompt was defined
    const batchTranslatePromptDefinition = (ai.definePrompt as jest.Mock).mock.calls.find(call => call[0].name === 'batchTranslateObjectsPrompt');
    // If it was defined, its mock function (batchTranslatePromptMockFn) should not have been called
    if (batchTranslatePromptDefinition && batchTranslatePromptMockFn) {
        expect(batchTranslatePromptMockFn).not.toHaveBeenCalled();
    } else if (batchTranslatePromptDefinition && !batchTranslatePromptMockFn) {
        // This case should ideally not happen if the mockImplementation is correct
        // but it means definePrompt was called for batchTranslate but our test-internal mock was not set
        const mockPromptFunctions = (ai.definePrompt as jest.Mock).mock.results;
        const batchTranslateResult = mockPromptFunctions.find((res,i) => (ai.definePrompt as jest.Mock).mock.calls[i][0].name === 'batchTranslateObjectsPrompt');
        if (batchTranslateResult && typeof batchTranslateResult.value === 'function') {
            expect(batchTranslateResult.value).not.toHaveBeenCalled();
        }
    }
  });

  it('should return items with empty translations if translation API fails or returns null', async () => {
    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string }) => {
      if (promptConfig.name === 'identifyObjectsPrompt') {
        return jest.fn(async (input: any) => ({
          output: { objects: ['apple', 'banana'] },
        }));
      }
      if (promptConfig.name === 'batchTranslateObjectsPrompt') {
        return jest.fn(async (input: any) => ({
          output: null, // Simulate translation API failure
        }));
      }
      return jest.fn(async () => ({ output: null }));
    });

    const input: IdentifyObjectsInput = { photoDataUri: 'data:image/jpeg;base64,translationfail' };
    const result: IdentifyObjectsOutput = await identifyObjects(input);

    expect(result.identifiedItems).toHaveLength(2);
    expect(result.identifiedItems[0].original).toBe('apple');
    expect(result.identifiedItems[0].translations).toEqual({});
    expect(result.identifiedItems[1].original).toBe('banana');
    expect(result.identifiedItems[1].translations).toEqual({});
  });
});
