import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');
    const filename = url.searchParams.get('filename') || 'rap-scene.mp4';
    
    if (!videoUrl) {
      return NextResponse.json({
        success: false,
        error: 'Video URL is required'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid video URL format'
      }, { status: 400 });
    }

    console.log('Downloading video from:', videoUrl);

    // Fetch the video content
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`
      }, { status: 500 });
    }

    // Get the video content as array buffer
    const videoBuffer = await videoResponse.arrayBuffer();
    
    // Get content type from the original response or default to mp4
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    
    // Create response with appropriate headers for download
    const downloadResponse = new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'private, max-age=0',
        'X-Content-Type-Options': 'nosniff'
      }
    });

    console.log(`Video download prepared: ${filename} (${videoBuffer.byteLength} bytes)`);
    
    return downloadResponse;

  } catch (error) {
    console.error('Download error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET with url and filename parameters.'
  }, { status: 405 });
}