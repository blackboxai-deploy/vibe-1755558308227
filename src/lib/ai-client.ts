// AI API client utilities for script and video generation

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIApiConfig {
  endpoint: string;
  headers: Record<string, string>;
  timeout: number;
}

// Custom endpoint configuration (no API keys required)
export const AI_CONFIG: AIApiConfig = {
  endpoint: 'https://oi-server.onrender.com/chat/completions',
  headers: {
    'CustomerId': 'cus_SGPn4uhjPI0F4w',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  },
  timeout: 300000 // 5 minutes
};

export const VIDEO_CONFIG: AIApiConfig = {
  ...AI_CONFIG,
  timeout: 900000 // 15 minutes for video generation
};

export class AIClient {
  private config: AIApiConfig;

  constructor(config: AIApiConfig = AI_CONFIG) {
    this.config = config;
  }

  async generateScript(userPrompt: string, systemPrompt: string): Promise<any> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    const requestBody = {
      model: 'openrouter/anthropic/claude-sonnet-4',
      messages,
      temperature: 0.8,
      max_tokens: 2000
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateVideo(prompt: string): Promise<any> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Generate a video: ${prompt}`
      }
    ];

    const requestBody = {
      model: 'replicate/google/veo-3',
      messages,
      temperature: 0.7
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), VIDEO_CONFIG.timeout);

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For video generation, the response might be binary or a URL
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return {
          success: true,
          videoUrl: data.output || data.url,
          metadata: data.metadata
        };
      } else {
        // Handle binary response
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        return {
          success: true,
          videoUrl,
          metadata: {
            size: videoBlob.size,
            type: videoBlob.type
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed'
      };
    }
  }

  async batchGenerateVideos(prompts: string[]): Promise<any[]> {
    const results = await Promise.allSettled(
      prompts.map(prompt => this.generateVideo(prompt))
    );

    return results.map((result, index) => ({
      sceneId: `scene-${index + 1}`,
      success: result.status === 'fulfilled',
      ...(result.status === 'fulfilled' ? result.value : { error: result.reason })
    }));
  }
}

// Default system prompt for script generation
export const DEFAULT_SYSTEM_PROMPT = `You are an expert rap music video director and scriptwriter. Your task is to create compelling, cinematic scripts for rap music videos.

When given a user prompt for a rap video concept, generate a detailed script with exactly 5 distinct scenes. Each scene should be 15-20 seconds long, creating a cohesive 90-second music video.

Return your response as a JSON object with this exact structure:
{
  "concept": "Brief description of the overall video concept",
  "style": "Visual style and mood (e.g., 'urban gritty', 'luxury lifestyle', 'artistic abstract')",
  "scenes": [
    {
      "id": "scene-1",
      "title": "Scene title",
      "description": "Detailed description of what happens in this scene",
      "videoPrompt": "Optimized prompt for AI video generation (be very specific about visuals, camera angles, lighting, and action)"
    }
  ],
  "totalDuration": 90
}

Guidelines for each scene:
- Make each scene visually distinct and engaging
- Include specific details about camera movements, lighting, and setting
- Ensure the rapper is the main focus in most scenes
- Create a narrative flow that builds energy
- Use dynamic, cinematic language in video prompts
- Consider urban settings, studio environments, performance spaces
- Include specific visual elements like lighting effects, camera angles, props

The video prompts should be detailed enough for an AI to generate high-quality, realistic rap music videos.`;

// Utility function to parse script from AI response
export function parseScriptResponse(content: string): any {
  try {
    // Try to parse as JSON first
    return JSON.parse(content);
  } catch {
    // If not valid JSON, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // If still fails, return a structured error
        return null;
      }
    }
    return null;
  }
}

export const aiClient = new AIClient();