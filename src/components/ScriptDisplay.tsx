'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { GeneratedScript } from '@/types';

interface ScriptDisplayProps {
  script: GeneratedScript;
  onGenerateVideos: () => void;
  onBack: () => void;
  isGeneratingVideos: boolean;
}

export default function ScriptDisplay({ 
  script, 
  onGenerateVideos, 
  onBack, 
  isGeneratingVideos 
}: ScriptDisplayProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Your Rap Video Script
        </h1>
        <p className="text-muted-foreground">
          Review your AI-generated script and proceed to create the videos
        </p>
      </div>

      {/* Script Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Script Overview
                <Badge variant="secondary">{script.scenes.length} Scenes</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {script.concept}
              </CardDescription>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">Style</div>
              <Badge variant="outline">{script.style}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{script.scenes.length}</div>
              <div className="text-sm text-muted-foreground">Total Scenes</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-pink-600">{script.totalDuration}s</div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                ~{Math.round(script.totalDuration / script.scenes.length)}s
              </div>
              <div className="text-sm text-muted-foreground">Per Scene</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenes */}
      <div className="grid gap-4">
        {script.scenes.map((scene, index) => (
          <Card key={scene.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    {scene.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {scene.duration || 18}s duration
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Scene {index + 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scene Description */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Scene Description</h4>
                <p className="text-sm leading-relaxed">
                  {scene.description}
                </p>
              </div>

              <Separator />

              {/* Video Prompt */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">AI Video Prompt</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-mono leading-relaxed">
                    {scene.videoPrompt}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isGeneratingVideos}
          className="px-8"
        >
          Back to Edit
        </Button>
        <Button
          onClick={onGenerateVideos}
          disabled={isGeneratingVideos}
          className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isGeneratingVideos ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Videos...
            </div>
          ) : (
            'Generate Videos'
          )}
        </Button>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Video Generation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">What to Expect:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Each scene will be generated as a separate video</li>
                <li>• Videos are optimized for rap music content</li>
                <li>• Generation typically takes 2-5 minutes per scene</li>
                <li>• All videos will be available for download</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Technical Details:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Videos are generated in high quality</li>
                <li>• Optimized for widescreen format (16:9)</li>
                <li>• Professional cinematography and lighting</li>
                <li>• Urban rap aesthetic automatically applied</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}