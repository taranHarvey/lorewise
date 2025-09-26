// Database types for LoreWise

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
  };
}

export interface Novel {
  id: string;
  userId: string;
  title: string;
  description?: string;
  genre?: string;
  targetAudience?: string;
  wordCount: number;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
  createdAt: Date;
  updatedAt: Date;
  seriesId?: string; // Link to series if part of one
  order?: number; // For custom ordering of novels
}

export interface Series {
  id: string;
  userId: string;
  title: string;
  description?: string;
  genre?: string;
  totalBooks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  chapterNumber: number;
  wordCount: number;
  status: 'draft' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  description: string;
  age?: number;
  gender?: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  appearance?: string;
  personality?: string;
  backstory?: string;
  relationships?: string[];
  seriesId?: string; // If character appears in multiple books
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'city' | 'country' | 'building' | 'landmark' | 'other';
  details?: string;
  seriesId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlotPoint {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'conflict' | 'resolution' | 'twist' | 'climax' | 'other';
  importance: 'low' | 'medium' | 'high' | 'critical';
  seriesId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIInteraction {
  id: string;
  userId: string;
  type: 'writing_assistance' | 'plot_help' | 'character_development' | 'consistency_check';
  prompt: string;
  response: string;
  context?: {
    novelId?: string;
    chapterId?: string;
    characterId?: string;
  };
  createdAt: Date;
}

export interface UploadedDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'docx' | 'epub' | 'pdf';
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  analysis?: {
    characters: string[];
    locations: string[];
    plotPoints: string[];
    wordCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
