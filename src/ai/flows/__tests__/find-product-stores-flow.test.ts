
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
// This is not strictly necessary for these tests as we mock the prompt output directly,
// but it's good practice if we wanted to verify the tool was called correctly.
jest.mock('@/ai/tools/find-stores-tool', () => {
    const originalModule = jest.requireActual('@/ai/tools/find-stores-tool');
    return {
        ...originalModule, 
        findStoresTool: { 
            ...originalModule.findStoresTool,
        }
    };
});


describe('findProductStores Flow', () => {
  beforeEach(() => {
    (ai.definePrompt as jest.Mock).mockClear();
  });

  it('should return stores when the tool finds them (no location)', async () => {
    const mockProductName = 'Test Product With Stores';
    const mockStoresFound = ['Store A', 'Store B'];

    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string, tools: any[] }) => {
      expect(promptConfig.tools).toEqual(expect.arrayContaining([findStoresTool]));
      
      return jest.fn(async (input: FindProductStoresInput) => {
        expect(input.productName).toBe(mockProductName);
        expect(input.latitude).toBeUndefined();
        expect(input.longitude).toBeUndefined();
        return {
          output: {
            productName: input.productName,
            foundStores: mockStoresFound, 
          },
        };
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

  it('should return stores when the tool finds them (with location)', async () => {
    const mockProductName = 'Test Product With Stores And Location';
    const mockLatitude = -22.9068;
    const mockLongitude = -43.1729;
    const mockStoresFound = ['Store C', 'Store D (Near User)'];

    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string, tools: any[] }) => {
      expect(promptConfig.tools).toEqual(expect.arrayContaining([findStoresTool]));
      
      return jest.fn(async (input: FindProductStoresInput) => {
        expect(input.productName).toBe(mockProductName);
        expect(input.latitude).toBe(mockLatitude);
        expect(input.longitude).toBe(mockLongitude);
        // Simulate that the LLM/tool used the location and returned appropriate stores
        return {
          output: {
            productName: input.productName,
            foundStores: mockStoresFound, 
          },
        };
      });
    });

    const input: FindProductStoresInput = { 
        productName: mockProductName,
        latitude: mockLatitude,
        longitude: mockLongitude
    };
    const result: FindProductStoresOutput = await findProductStores(input);

    expect(result.productName).toBe(mockProductName);
    expect(result.foundStores).toEqual(mockStoresFound);
  });


  it('should return an empty array when the tool finds no stores', async () => {
    const mockProductName = 'Test Product Without Stores';
    
    (ai.definePrompt as jest.Mock).mockImplementation((promptConfig: { name: string }) => {
        return jest.fn(async (input: FindProductStoresInput) => {
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
        return { output: null };
      });
    });

    const input: FindProductStoresInput = { productName: mockProductName };
    const result: FindProductStoresOutput = await findProductStores(input);

    expect(result.productName).toBe(mockProductName);
    expect(result.foundStores).toEqual([]);
  });
});

