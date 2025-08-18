import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';
import type { VideoGenerationRequest, VideoGenerationResult, VideoApiResponse, RapScene } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: VideoGenerationRequest = await request.json();
    
    // Validate request
    if (!body.scenes || !Array.isArray(body.scenes)) {
      return NextResponse.json({
        success: false,
        error: 'Scenes array is required'
      } satisfies VideoApiResponse, { status: 400 });
    }

    if (body.scenes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one scene is required'
      } satisfies VideoApiResponse, { status: 400 });
    }

    if (body.scenes.length > 10) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 10 scenes allowed'
      } satisfies VideoApiResponse, { status: 400 });
    }

    // Validate each scene
    for (let i = 0; i < body.scenes.length; i++) {
      const scene = body.scenes[i];
      if (!scene.id || !scene.videoPrompt) {
        return NextResponse.json({
          success: false,
          error: `Scene ${i + 1} is missing required fields (id, videoPrompt)`
        } satisfies VideoApiResponse, { status: 400 });
      }
    }

    console.log(`Starting video generation for ${body.scenes.length} scenes`);

    // Enhance video prompts based on quality and aspect ratio settings
    const enhancedPrompts = body.scenes.map((scene: RapScene) => {
      let prompt = scene.videoPrompt;
      
      // Add quality modifiers
      if (body.quality === 'high') {
        prompt += '. High definition, professional cinematography, sharp details.';
      } else if (body.quality === 'ultra') {
        prompt += '. Ultra high definition, cinematic masterpiece, perfect lighting, professional film quality.';
      }
      
      // Add aspect ratio information
      if (body.aspectRatio === '9:16') {
        prompt += ' Vertical format, mobile-optimized composition.';
      } else if (body.aspectRatio === '1:1') {
        prompt += ' Square format, social media optimized composition.';
      } else {
        prompt += ' Widescreen cinematic format.';
      }
      
      // Add rap video specific elements
      prompt += ' Rap music video style, dynamic urban energy, professional music video production.';
      
      return prompt;
    });

    // Generate videos in parallel
    console.log('Generating videos in parallel...');
    const videoResults = await aiClient.batchGenerateVideos(enhancedPrompts);
    
    // Process results
    const results: VideoGenerationResult[] = videoResults.map((result, index) => {
      const scene = body.scenes[index];
      
      if (result.success && result.videoUrl) {
        return {
          sceneId: scene.id,
          success: true,
          videoUrl: result.videoUrl,
          metadata: {
            duration: scene.duration || 18,
            size: result.metadata?.size || 0,
            format: result.metadata?.type || 'video/mp4'
          }
        };
      } else {
        return {
          sceneId: scene.id,
          success: false,
          error: result.error || 'Video generation failed for unknown reason'
        };
      }
    });

    // Count successful generations
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`Video generation completed: ${successCount} successful, ${failureCount} failed`);

    // Return results (partial success is still considered success if at least one video was generated)
    if (successCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'All video generations failed',
        results,
        processingTime: Date.now() - startTime
      } satisfies VideoApiResponse, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results,
      processingTime: Date.now() - startTime
    } satisfies VideoApiResponse);

  } catch (error) {
    console.error('Video generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      processingTime: Date.now() - startTime
    } satisfies VideoApiResponse, { status: 500 });
  }
}

// Add a status check endpoint for long-running operations
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const operation = url.searchParams.get('operation');
  
  if (operation === 'health') {
    return NextResponse.json({
      success: true,
      status: 'Video generation API is healthy',
      timestamp: new Date().toISOString(),
      supportedFormats: ['mp4', 'webm'],
      maxScenes: 10,
      supportedQualities: ['standard', 'high', 'ultra'],
      supportedAspectRatios: ['16:9', '9:16', '1:1']
    });
  }
  
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to generate videos or GET with ?operation=health for status.'
  }, { status: 405 });
}