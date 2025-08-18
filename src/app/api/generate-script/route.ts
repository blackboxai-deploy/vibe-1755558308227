import { NextRequest, NextResponse } from 'next/server';
import { aiClient, DEFAULT_SYSTEM_PROMPT, parseScriptResponse } from '@/lib/ai-client';
import type { ScriptGenerationRequest, GeneratedScript, ScriptApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ScriptGenerationRequest = await request.json();
    
    // Validate request
    if (!body.userPrompt || typeof body.userPrompt !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'User prompt is required and must be a string'
      } satisfies ScriptApiResponse, { status: 400 });
    }

    if (body.userPrompt.length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Prompt must be at least 10 characters long'
      } satisfies ScriptApiResponse, { status: 400 });
    }

    if (body.userPrompt.length > 1000) {
      return NextResponse.json({
        success: false,
        error: 'Prompt must be less than 1000 characters'
      } satisfies ScriptApiResponse, { status: 400 });
    }

    // Use custom system prompt if provided, otherwise use default
    const systemPrompt = body.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    
    // Enhance user prompt with style and duration preferences
    let enhancedPrompt = body.userPrompt;
    if (body.style) {
      enhancedPrompt += `\n\nStyle preference: ${body.style}`;
    }
    if (body.duration && body.duration !== 90) {
      enhancedPrompt += `\n\nPreferred total duration: ${body.duration} seconds`;
    }

    console.log('Generating script for prompt:', enhancedPrompt.substring(0, 100) + '...');

    // Generate script using AI
    const aiResponse = await aiClient.generateScript(enhancedPrompt, systemPrompt);
    
    if (!aiResponse.success) {
      return NextResponse.json({
        success: false,
        error: `Script generation failed: ${aiResponse.error}`,
        processingTime: Date.now() - startTime
      } satisfies ScriptApiResponse, { status: 500 });
    }

    // Parse the AI response
    const parsedScript = parseScriptResponse(aiResponse.content);
    
    if (!parsedScript) {
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response into valid script format',
        processingTime: Date.now() - startTime
      } satisfies ScriptApiResponse, { status: 500 });
    }

    // Validate parsed script structure
    if (!parsedScript.scenes || !Array.isArray(parsedScript.scenes)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid script format: missing or invalid scenes array',
        processingTime: Date.now() - startTime
      } satisfies ScriptApiResponse, { status: 500 });
    }

    if (parsedScript.scenes.length !== 5) {
      return NextResponse.json({
        success: false,
        error: `Invalid script format: expected 5 scenes, got ${parsedScript.scenes.length}`,
        processingTime: Date.now() - startTime
      } satisfies ScriptApiResponse, { status: 500 });
    }

    // Validate each scene has required fields
    for (let i = 0; i < parsedScript.scenes.length; i++) {
      const scene = parsedScript.scenes[i];
      if (!scene.id || !scene.title || !scene.description || !scene.videoPrompt) {
        return NextResponse.json({
          success: false,
          error: `Invalid scene ${i + 1}: missing required fields (id, title, description, videoPrompt)`,
          processingTime: Date.now() - startTime
        } satisfies ScriptApiResponse, { status: 500 });
      }
    }

    // Construct final script object
    const script: GeneratedScript = {
      concept: parsedScript.concept || 'Custom rap music video',
      scenes: parsedScript.scenes.map((scene: any, index: number) => ({
        id: scene.id || `scene-${index + 1}`,
        title: scene.title,
        description: scene.description,
        videoPrompt: scene.videoPrompt,
        duration: scene.duration || 18 // Default 18 seconds per scene
      })),
      totalDuration: parsedScript.totalDuration || 90,
      style: parsedScript.style || body.style || 'dynamic urban'
    };

    console.log('Script generated successfully:', {
      concept: script.concept,
      sceneCount: script.scenes.length,
      totalDuration: script.totalDuration,
      processingTime: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      script,
      processingTime: Date.now() - startTime
    } satisfies ScriptApiResponse);

  } catch (error) {
    console.error('Script generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      processingTime: Date.now() - startTime
    } satisfies ScriptApiResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to generate scripts.'
  }, { status: 405 });
}