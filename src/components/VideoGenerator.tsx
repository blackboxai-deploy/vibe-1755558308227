'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VideoGenerationStatus, RapScene } from '@/types';

interface VideoGeneratorProps {
  scenes: RapScene[];
  onComplete: (results: any[]) => void;
  onBack: () => void;
}

export default function VideoGenerator({ scenes, onComplete, onBack }: VideoGeneratorProps) {
  const [statuses, setStatuses] = useState<VideoGenerationStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Initialize status for each scene
    const initialStatuses: VideoGenerationStatus[] = scenes.map(scene => ({
      sceneId: scene.id,
      status: 'pending',
      progress: 0
    }));
    setStatuses(initialStatuses);
    
    // Start generation immediately
    startVideoGeneration();
  }, [scenes]);

  const startVideoGeneration = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Update all scenes to generating status
      setStatuses(prev => prev.map(status => ({ 
        ...status, 
        status: 'generating' as const,
        startTime: Date.now(),
        estimatedCompletion: Date.now() + 240000 // 4 minutes estimate
      })));

      // Call the video generation API
      const response = await fetch('/api/generate-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenes,
          quality: 'high',
          aspectRatio: '16:9'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Video generation failed');
      }

      // Update statuses based on results
      const updatedStatuses = statuses.map(status => {
        const result = data.results?.find((r: any) => r.sceneId === status.sceneId);
        if (result) {
          return {
            ...status,
            status: result.success ? 'completed' as const : 'failed' as const,
            progress: 100,
            videoUrl: result.videoUrl,
            error: result.error
          };
        }
        return { ...status, status: 'failed' as const, error: 'No result received' };
      });

      setStatuses(updatedStatuses);
      setOverallProgress(100);

      // Pass results to parent
      onComplete(data.results || []);

    } catch (err) {
      console.error('Video generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Mark all as failed
      setStatuses(prev => prev.map(status => ({
        ...status,
        status: 'failed' as const,
        error: 'Generation failed'
      })));
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulate progress updates during generation
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setStatuses(prev => prev.map(status => {
        if (status.status === 'generating' && status.progress < 90) {
          // Simulate progress with some randomness
          const increment = Math.random() * 5 + 2; // 2-7% increment
          return {
            ...status,
            progress: Math.min(90, status.progress + increment)
          };
        }
        return status;
      }));

      // Update overall progress
      setOverallProgress(prev => {
        const avgProgress = statuses.reduce((sum, status) => sum + status.progress, 0) / statuses.length;
        return Math.min(95, avgProgress);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, statuses.length]);

  const getStatusColor = (status: VideoGenerationStatus['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'generating': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: VideoGenerationStatus['status']) => {
    switch (status) {
      case 'pending': return 'Waiting...';
      case 'generating': return 'Generating...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const completedCount = statuses.filter(s => s.status === 'completed').length;
  const failedCount = statuses.filter(s => s.status === 'failed').length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Generating Your Videos
        </h1>
        <p className="text-muted-foreground">
          AI is creating {scenes.length} unique video scenes for your rap music video
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generation Progress</span>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Badge variant="default" className="bg-green-500">
                  {completedCount} Complete
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="destructive">
                  {failedCount} Failed
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Processing {scenes.length} scenes in parallel using advanced AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scene Progress */}
      <div className="grid gap-4">
        {statuses.map((status, index) => {
          const scene = scenes.find(s => s.id === status.sceneId);
          if (!scene) return null;

          return (
            <Card key={status.sceneId} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)} animate-pulse`} />
                    Scene {index + 1}: {scene.title}
                  </CardTitle>
                  <Badge variant="outline">
                    {getStatusText(status.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {scene.description}
                </div>
                
                <div className="space-y-2">
                  <Progress value={status.progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {status.status === 'generating' && status.estimatedCompletion 
                        ? `Est. completion: ${Math.max(0, Math.round((status.estimatedCompletion - Date.now()) / 1000))}s`
                        : status.status === 'completed'
                        ? 'Video ready!'
                        : status.status === 'failed'
                        ? status.error || 'Generation failed'
                        : 'Initializing...'
                      }
                    </span>
                    <span>{Math.round(status.progress)}%</span>
                  </div>
                </div>

                {status.error && (
                  <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                    Error: {status.error}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Generation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
              >
                Retry Generation
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                size="sm"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips while waiting */}
      {isGenerating && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg">While You Wait...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">What's Happening:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• AI is analyzing your script prompts</li>
                  <li>• Generating cinematic video sequences</li>
                  <li>• Optimizing for rap music aesthetics</li>
                  <li>• Processing high-quality visuals</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Expected Timeline:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Each scene: 2-5 minutes</li>
                  <li>• Total time: 10-25 minutes</li>
                  <li>• Parallel processing for speed</li>
                  <li>• Progress updates in real-time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}