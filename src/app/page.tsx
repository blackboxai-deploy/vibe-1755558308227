'use client';

import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import PromptInput from '@/components/PromptInput';
import ScriptDisplay from '@/components/ScriptDisplay';
import VideoGenerator from '@/components/VideoGenerator';
import ResultsGallery from '@/components/ResultsGallery';
import type { AppState, GeneratedScript, VideoGenerationResult } from '@/types';

type AppStage = 'input' | 'script' | 'generating' | 'results';

export default function Home() {
  const [stage, setStage] = useState<AppStage>('input');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [videoResults, setVideoResults] = useState<VideoGenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptSubmit = async (prompt: string) => {
    setUserPrompt(prompt);
    setIsLoading(true);

    try {
      toast.info('Generating your rap video script...', {
        description: 'This may take a few moments while AI creates your scenes.'
      });

      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: prompt,
          style: 'dynamic urban',
          duration: 90
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setGeneratedScript(data.script);
      setStage('script');

      toast.success('Script generated successfully!', {
        description: `Created ${data.script.scenes.length} unique scenes for your rap video.`
      });

    } catch (error) {
      console.error('Script generation failed:', error);
      toast.error('Script generation failed', {
        description: error instanceof Error ? error.message : 'Please try again with a different prompt.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideos = () => {
    if (!generatedScript) return;
    setStage('generating');
    toast.info('Starting video generation...', {
      description: `Generating ${generatedScript.scenes.length} video scenes in parallel.`
    });
  };

  const handleVideoComplete = (results: VideoGenerationResult[]) => {
    setVideoResults(results);
    setStage('results');
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      toast.success('All videos generated successfully!', {
        description: `${successCount} high-quality rap video scenes are ready for download.`
      });
    } else if (successCount > 0) {
      toast.warning('Videos partially generated', {
        description: `${successCount} of ${totalCount} videos completed successfully.`
      });
    } else {
      toast.error('Video generation failed', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleBack = () => {
    switch (stage) {
      case 'script':
        setStage('input');
        setGeneratedScript(null);
        break;
      case 'generating':
        setStage('script');
        break;
      case 'results':
        setStage('script');
        setVideoResults([]);
        break;
    }
  };

  const handleStartOver = () => {
    setStage('input');
    setUserPrompt('');
    setGeneratedScript(null);
    setVideoResults([]);
    setIsLoading(false);
    
    toast.success('Ready for a new creation!', {
      description: 'Enter a new prompt to generate another rap video.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/10 dark:to-pink-950/10">
      <div className="container mx-auto px-4 py-8">
        {/* Stage Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {(['input', 'script', 'generating', 'results'] as const).map((stageName, index) => {
              const isActive = stage === stageName;
              const isCompleted = ['input', 'script', 'generating', 'results'].indexOf(stage) > index;
              
              return (
                <div key={stageName} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }
                  `}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`
                      w-12 h-0.5 mx-2
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {stage === 'input' && 'Enter your rap video concept'}
              {stage === 'script' && 'Review and approve your script'}
              {stage === 'generating' && 'AI is creating your videos'}
              {stage === 'results' && 'Your videos are ready!'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          {stage === 'input' && (
            <PromptInput
              onSubmit={handlePromptSubmit}
              isLoading={isLoading}
            />
          )}

          {stage === 'script' && generatedScript && (
            <ScriptDisplay
              script={generatedScript}
              onGenerateVideos={handleGenerateVideos}
              onBack={handleBack}
              isGeneratingVideos={false}
            />
          )}

          {stage === 'generating' && generatedScript && (
            <VideoGenerator
              scenes={generatedScript.scenes}
              onComplete={handleVideoComplete}
              onBack={handleBack}
            />
          )}

          {stage === 'results' && generatedScript && (
            <ResultsGallery
              results={videoResults}
              scenes={generatedScript.scenes}
              onStartOver={handleStartOver}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <div className="space-y-2">
            <p>AI Rap Video Generator - Create professional music videos with artificial intelligence</p>
            <div className="flex justify-center gap-4">
              <span>✨ AI-Powered Script Generation</span>
              <span>🎬 Professional Video Creation</span>
              <span>⚡ Real-time Processing</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}