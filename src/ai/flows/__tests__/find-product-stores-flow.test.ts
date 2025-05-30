
import { findProductStores, type FindProductStoresInput, type FindProductStoresOutput } from '../find-product-stores-flow';
import { ai } from '@/ai/genkit';
import { findStoresTool } from '@/ai/tools/find-stores-tool'; // Import the actual tool

// Mock the genkit ai module for defineFlow and definePrompt
// We want to test the flow's interaction with the (mocked) tool
jest.mock('@/ai/genkit', () => {
  const actualGenkitAI = jest.requireActual('@/ai/genkit').ai;
  return {
    ai: {
      ...actualGenkitAI,
      defineFlow: jest.fn((config, flowFunc) => flowFunc),
      definePrompt: jest.fn(),
      // We are not mocking defineTool here, as we want to use the real tool's schema
      // but the tool's *implementation* will be mocked via findStoresTool itself.
    },
  };
});

// Mock the findStoresTool *implementation* specifically
jest.mock('@/ai/tools/find-stores-tool', () => {
    const originalModule = jest.requireActual('@/ai/tools/find-stores-tool');
    return {
        ...originalModule, // Preserve schemas
        findStoresTool: { // Mock the tool object itself
            ...originalModule.findStoresTool, // Preserve structure
            // The actual function called by the LLM/Genkit is not directly invoked in this test setup
            // Instead, the `ai.definePrompt`'s mock will simulate the tool's output
            // as if the LLM decided to call it and got a response.
            // If we needed to test the tool's *internal* logic, we'd mock its async handler directly.
        }
    };
});


describe('findProductStores Flow', () => {
  beforeEach(() => {
    (ai.definePrompt as jest.Mock).mockClear();
  });

  it('should return stores when the tool finds them', async () => {
    const mockProductName = 'Test Product With Stores';
    const mockStoresFound = ['Store A', 'Store B'];

    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string, tools: any[] }) => {
      // Ensure the prompt is configured with the correct tool
      expect(promptConfig.tools).toEqual(expect.arrayContaining([findStoresTool]));
      
      return jest.fn(async (input: FindProductStoresInput) => {
        // Simulate the LLM deciding to use the tool and receiving its output
        // The LLM (simulated by this mock prompt) is then expected to format this into the final flow output.
        if (input.productName === mockProductName) {
          return {
            output: {
              productName: input.productName,
              foundStores: mockStoresFound, // This is what the LLM would structure based on the tool's (simulated) return
            },
          };
        }
        return { output: { productName: input.productName, foundStores: [] }};
      });
    });

    const input: FindProductStoresInput = { productName: mockProductName };
    const result: FindProductStoresOutput = await findProductStores(input);

    expect(result.productName).toBe(mockProductName);
    expect(result.foundStores).toEqual(mockStoresFound);
    expect(ai.definePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'findStoresPrompt',
        tools: expect.arrayContaining([findStoresTool]),
      })
    );
  });

  it('should return an empty array when the tool finds no stores', async () => {
    const mockProductName = 'Test Product Without Stores';
    
    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string }) => {
        return jest.fn(async (input: FindProductStoresInput) => {
            // Simulate LLM receiving empty stores from the tool and formatting output
            return {
                output: {
                  productName: input.productName,
                  foundStores: [],
                },
              };
        });
    });

    const input: FindProductStoresInput = { productName: mockProductName };
    const result: FindProductStoresOutput = await findProductStores(input);

    expect(result.productName).toBe(mockProductName);
    expect(result.foundStores).toEqual([]);
  });

   it('should handle null output from prompt by returning default empty stores', async () => {
    const mockProductName = 'Product With Null Prompt Output';
    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string }) => {
      return jest.fn(async (input: FindProductStoresInput) => {
        // Simulate the prompt returning a completely null output
        return { output: null };
      });
    });

    const input: FindProductStoresInput = { productName: mockProductName };
    const result: FindProductStoresOutput = await findProductStores(input);

    expect(result.productName).toBe(mockProductName);
    expect(result.foundStores).toEqual([]);
    // You might want to spy on console.warn here if that's critical
  });
});

```