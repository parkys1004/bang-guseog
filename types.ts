
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string; 
  backdropUrl?: string; 
  category: string; 
  author?: string;
  date?: string;
  url: string; 
  isNew?: boolean;
  isPro?: boolean;
}

export interface EbookItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  isPro: boolean;
  isFree?: boolean;
  url: string;
}

export type Category = '전체' | 'AI STUDIO' | 'VERCEL' | 'ETC' | '전자책';
