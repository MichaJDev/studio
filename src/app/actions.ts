// src/app/actions.ts
'use server';

import { generateVideoDescription as generateVideoDescriptionFlow, type GenerateVideoDescriptionInput } from '@/ai/flows/generate-video-description';

export async function handleGenerateDescriptionAction(input: GenerateVideoDescriptionInput): Promise<{ description?: string, error?: string }> {
  try {
    // Validate input if necessary, though Zod in flow should handle it.
    // For example, check videoDataUri format or size if needed here before calling the flow.
    if (!input.videoDataUri.startsWith('data:video/')) {
        return { error: "Invalid video data URI format. Ensure it's a video file." };
    }
    
    const result = await generateVideoDescriptionFlow(input);
    return { description: result.description };
  } catch (error: any) {
    console.error("Error generating video description:", error);
    // Check for specific Genkit/AI errors if possible to provide more context
    if (error.message && error.message.includes('media')) {
        return { error: "AI model failed to process the video. It might be too long, corrupted, or an unsupported format by the model." };
    }
    return { error: "Failed to generate description. Please try again." };
  }
}
