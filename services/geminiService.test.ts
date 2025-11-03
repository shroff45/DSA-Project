// FIX: Import Jest's global functions from '@jest/globals' to resolve TypeScript errors.
import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
// FIX: Use a named import for `getAlgorithmAdvice` as it is not a default export.
import { getAlgorithmAdvice } from './geminiService';
import { GoogleGenAI } from '@google/genai';
import { AdvisorResponse } from '../types';

// The following is written in Jest syntax. A test runner like Jest is required to execute these tests.

// Mock the entire @google/genai module. In a Jest environment, this would
// automatically replace the actual module with this mock implementation.
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
  Type: { // The 'Type' enum also needs to be available for the service file to import
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    STRING: 'STRING',
  },
}));

// Spy on console.error to verify error logging without polluting the test output
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('getAlgorithmAdvice', () => {
  const originalApiKey = process.env.API_KEY;

  beforeEach(() => {
    // Reset mocks and environment variables before each test
    jest.clearAllMocks();
    process.env.API_KEY = 'test-api-key';
  });

  afterAll(() => {
    // Clean up after all tests are done
    process.env.API_KEY = originalApiKey;
    consoleErrorSpy.mockRestore();
  });

  it('should throw an error if API_KEY is not set', async () => {
    delete process.env.API_KEY;
    await expect(getAlgorithmAdvice('test problem')).rejects.toThrow(
      'API_KEY environment variable is not set.'
    );
  });

  it('should call the Gemini API with the correct parameters and return a parsed response on success', async () => {
    const mockApiResponse: AdvisorResponse = {
      summary: 'Use Quick Sort for efficiency.',
      recommendations: [
        {
          algorithmName: 'Quick Sort',
          dataStructures: ['Array'],
          description: 'A fast sorting algorithm.',
          timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' },
          spaceComplexity: 'O(log n)',
          useCase: 'Good for large, unsorted arrays.',
          cCodeSnippet: '#include <stdio.h> ...',
          difficulty: 'Medium',
          relatedAlgorithms: [
            { name: 'Merge Sort', reason: 'Another efficient, divide-and-conquer sorting algorithm.' },
            { name: 'Heap Sort', reason: 'An in-place comparison-based sorting algorithm with similar time complexity.' },
          ],
          mermaidFlowchart: 'graph TD; A[Start] --> B(Select Pivot); B --> C{Partition}; C --> D[Sort Left]; C --> E[Sort Right];',
        },
      ],
    };

    // Simulate a successful API response
    // FIX: Use jest.MockedFunction with a function signature generic to correctly type the mock for async operations.
    (mockGenerateContent as jest.MockedFunction<() => Promise<{ text: string }>>).mockResolvedValue({
      text: JSON.stringify(mockApiResponse),
    });

    const result = await getAlgorithmAdvice('sort this array');

    // Assert the result is what we expect
    expect(result).toEqual(mockApiResponse);
    
    // Assert that the API was initialized and called correctly
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: "gemini-2.5-pro",
      contents: 'sort this array',
    }));
  });

  it('should throw a user-friendly error if the Gemini API call fails', async () => {
    const apiError = new Error('API request failed: 500 Internal Server Error');
    // FIX: Use jest.MockedFunction with a function signature generic to correctly type the mock for async operations.
    (mockGenerateContent as jest.MockedFunction<() => Promise<{ text: string }>>).mockRejectedValue(apiError);

    await expect(getAlgorithmAdvice('test problem')).rejects.toThrow(
      'An unexpected error occurred while communicating with the AI. Please try again shortly.'
    );

    // Verify that the original error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error calling Gemini API for advice:', apiError);
  });

  it('should throw a user-friendly error if the API response is not valid JSON', async () => {
    // Simulate an API response with a malformed JSON string
    // FIX: Use jest.MockedFunction with a function signature generic to correctly type the mock for async operations.
    (mockGenerateContent as jest.MockedFunction<() => Promise<{ text: string }>>).mockResolvedValue({
      text: '{ "summary": "incomplete json...',
    });

    await expect(getAlgorithmAdvice('test problem')).rejects.toThrow(
      'The AI returned a response in an unexpected format. This can happen with complex queries. Please try simplifying your problem description.'
    );

    // Verify that the JSON parsing error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error calling Gemini API for advice:',
        expect.any(SyntaxError)
    );
  });
});
