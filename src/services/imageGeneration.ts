import { generateOptimizedPrompt } from './promptGeneration';

// Hardcoded API key for development - replace with your actual key
const STABILITY_API_KEY = 'sk-Ysxe7lVtoIIVbtIjQoa2yGSSOUF1nH8BfegAUJxg8RYh0tpr';

export async function generateImage(description: string, year: number): Promise<string> {
  try {
    console.log('Generating image for:', { description, year });
    
    const { prompt, negative_prompt } = generateOptimizedPrompt(description, year);
    console.log('Generated prompt:', { prompt, negative_prompt });

    // Use hardcoded key for development, fallback to environment variables
    const apiKey = process.env.STABILITY_API_KEY || STABILITY_API_KEY;
    if (!apiKey) {
      throw new Error('STABILITY_API_KEY is not available');
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: negative_prompt,
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Stability API error:', error);
      throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Image generation successful');
    
    if (result.artifacts?.[0]?.base64) {
      return `data:image/png;base64,${result.artifacts[0].base64}`;
    } else {
      throw new Error('No image data in response');
    }
  } catch (error) {
    console.error('Error in generateImage:', error);
    throw error;
  }
} 