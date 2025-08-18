'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "A high-energy rap video in a neon-lit cyberpunk city with futuristic cars and holographic displays",
  "Underground hip-hop vibe in a warehouse with graffiti walls, street dancers, and dramatic lighting",
  "Luxury lifestyle rap video featuring expensive cars, jewelry, and penthouse views",
  "Old school rap homage with vintage aesthetics, vinyl records, and retro streetwear",
  "Artistic abstract rap video with surreal visuals, color splashes, and creative transitions"
];

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handlePromptChange = (value: string) => {
    if (value.length <= 1000) {
      setPrompt(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = () => {
    if (prompt.trim().length >= 10) {
      onSubmit(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setCharCount(example.length);
  };

  const isValidPrompt = prompt.trim().length >= 10 && prompt.trim().length <= 1000;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Rap Video Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create epic rap music videos with AI. Describe your vision and we'll generate 5 unique scenes 
          that bring your concept to life.
        </p>
      </div>

      {/* Main Input Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Describe Your Rap Video Concept
            <Badge variant="secondary" className="text-xs">
              AI Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Tell us about the style, setting, mood, and visual elements you want in your rap music video. 
            Be as creative and detailed as possible!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Example: A high-energy rap video set in a neon-lit cyberpunk city with the rapper performing on rooftops, surrounded by holographic displays and futuristic cars racing through the streets below..."
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              className="min-h-[120px] resize-none text-base"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                {charCount < 10 ? 'Minimum 10 characters required' : 'Looking good!'}
              </span>
              <span className={charCount > 900 ? 'text-orange-500' : ''}>
                {charCount}/1000
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={!isValidPrompt || isLoading}
            className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating Script...
              </div>
            ) : (
              'Generate Rap Video Script'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Example Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Inspiration?</CardTitle>
          <CardDescription>
            Click any example below to get started, or use them as inspiration for your own ideas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {example}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-xl">🎬</span>
          </div>
          <h3 className="font-semibold">5 Unique Scenes</h3>
          <p className="text-sm text-muted-foreground">
            Each video gets 5 professionally crafted scenes
          </p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-xl">⚡</span>
          </div>
          <h3 className="font-semibold">AI Powered</h3>
          <p className="text-sm text-muted-foreground">
            Advanced AI models create cinematic quality videos
          </p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-xl">📱</span>
          </div>
          <h3 className="font-semibold">Ready to Share</h3>
          <p className="text-sm text-muted-foreground">
            Download and share your videos instantly
          </p>
        </div>
      </div>
    </div>
  );
}