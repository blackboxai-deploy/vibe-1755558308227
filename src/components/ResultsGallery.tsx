'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { VideoGenerationResult, RapScene } from '@/types';

interface ResultsGalleryProps {
  results: VideoGenerationResult[];
  scenes: RapScene[];
  onStartOver: () => void;
}

export default function ResultsGallery({ results, scenes, onStartOver }: ResultsGalleryProps) {
  const [downloadingVideos, setDownloadingVideos] = useState<Set<string>>(new Set());

  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);

  const handleDownload = async (result: VideoGenerationResult, sceneTitle: string) => {
    if (!result.videoUrl) return;

    setDownloadingVideos(prev => new Set(prev).add(result.sceneId));

    try {
      const filename = `rap-scene-${result.sceneId}-${sceneTitle.toLowerCase().replace(/\s+/g, '-')}.mp4`;
      const downloadUrl = `/api/download?url=${encodeURIComponent(result.videoUrl)}&filename=${encodeURIComponent(filename)}`;
      
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.sceneId);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    for (const result of successfulResults) {
      const scene = scenes.find(s => s.id === result.sceneId);
      if (scene) {
        await handleDownload(result, scene.title);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Your Rap Video Collection
        </h1>
        <p className="text-muted-foreground">
          {successfulResults.length} of {results.length} videos generated successfully
        </p>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generation Summary</span>
            <div className="flex gap-2">
              {successfulResults.length > 0 && (
                <Badge variant="default" className="bg-green-500">
                  {successfulResults.length} Success
                </Badge>
              )}
              {failedResults.length > 0 && (
                <Badge variant="destructive">
                  {failedResults.length} Failed
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{successfulResults.length}</div>
              <div className="text-sm text-muted-foreground">Videos Created</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {successfulResults.reduce((sum, r) => sum + (r.metadata?.duration || 18), 0)}s
              </div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(successfulResults.reduce((sum, r) => sum + (r.metadata?.size || 0), 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-pink-600">HD</div>
              <div className="text-sm text-muted-foreground">Quality</div>
            </div>
          </div>

          {successfulResults.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-center">
                <Button
                  onClick={handleDownloadAll}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Download All Videos
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Successful Videos */}
      {successfulResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Videos</h2>
          <div className="grid gap-4">
            {successfulResults.map((result, index) => {
              const scene = scenes.find(s => s.id === result.sceneId);
              if (!scene) return null;

              const isDownloading = downloadingVideos.has(result.sceneId);

              return (
                <Card key={result.sceneId} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                            ✓
                          </span>
                          {scene.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {scene.description}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Ready
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Video Preview */}
                    {result.videoUrl && (
                      <div className="bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                          src={result.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    )}

                    {/* Video Info */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-muted-foreground">Duration</div>
                        <div>{formatDuration(result.metadata?.duration || 18)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-muted-foreground">File Size</div>
                        <div>{formatFileSize(result.metadata?.size || 0)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-muted-foreground">Format</div>
                        <div>{result.metadata?.format || 'MP4'}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(result, scene.title)}
                        disabled={isDownloading}
                        className="flex-1"
                      >
                        {isDownloading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Downloading...
                          </div>
                        ) : (
                          'Download Video'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Failed Videos */}
      {failedResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
            Failed Generations
          </h2>
          <div className="grid gap-4">
            {failedResults.map(result => {
              const scene = scenes.find(s => s.id === result.sceneId);
              if (!scene) return null;

              return (
                <Card key={result.sceneId} className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <span className="w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                        ✗
                      </span>
                      {scene.title}
                    </CardTitle>
                    <CardDescription>
                      {scene.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded">
                      <strong>Error:</strong> {result.error || 'Unknown error occurred'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onStartOver}
          variant="outline"
          className="px-8"
        >
          Create Another Video
        </Button>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Your Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Sharing & Usage:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Videos are optimized for social media platforms</li>
                <li>• Perfect for Instagram, TikTok, and YouTube</li>
                <li>• High-quality format suitable for professional use</li>
                <li>• Add your own music track for complete videos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Download individual scenes or all at once</li>
                <li>• Edit together for a complete music video</li>
                <li>• Use video editing software for final touches</li>
                <li>• Create variations with different prompts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}