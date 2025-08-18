// Core types for the rap music video generator

export interface RapScene {
  id: string;
  title: string;
  description: string;
  videoPrompt: string;
  duration?: number;
}

export interface GeneratedScript {
  concept: string;
  scenes: RapScene[];
  totalDuration: number;
  style: string;
}

export interface VideoGenerationStatus {
  sceneId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  startTime?: number;
  estimatedCompletion?: number;
}

export interface VideoGenerationResult {
  sceneId: string;
  success: boolean;
  videoUrl?: string;
  error?: string;
  metadata?: {
    duration: number;
    size: number;
    format: string;
  };
}

export interface AIApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export interface ScriptGenerationRequest {
  userPrompt: string;
  systemPrompt?: string;
  style?: string;
  duration?: number;
}

export interface VideoGenerationRequest {
  scenes: RapScene[];
  quality?: 'standard' | 'high' | 'ultra';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface ProgressState {
  stage: 'input' | 'script-generation' | 'video-generation' | 'completed' | 'error';
  scriptProgress: number;
  videoProgress: VideoGenerationStatus[];
  currentStep?: string;
  error?: string;
}

export interface UserSettings {
  systemPrompt: string;
  videoQuality: 'standard' | 'high' | 'ultra';
  aspectRatio: '16:9' | '9:16' | '1:1';
  preferredStyle: string;
}

export interface AppState {
  userPrompt: string;
  generatedScript?: GeneratedScript;
  videoResults: VideoGenerationResult[];
  progress: ProgressState;
  settings: UserSettings;
  isLoading: boolean;
}

// API endpoint response types
export interface ScriptApiResponse {
  success: boolean;
  script?: GeneratedScript;
  error?: string;
  processingTime?: number;
}

export interface VideoApiResponse {
  success: boolean;
  results?: VideoGenerationResult[];
  error?: string;
  processingTime?: number;
}

// Error types
export interface AppError {
  type: 'script-generation' | 'video-generation' | 'network' | 'validation';
  message: string;
  details?: any;
  timestamp: number;
  recoverable: boolean;
}