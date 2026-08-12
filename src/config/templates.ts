export type TemplateType = 'react' | 'html' | 'html-js';

export interface TemplateConfig {
  id: string;
  slug?: string;
  name: string;
  type: TemplateType;
  category: string;
  desc: string;
  price: string;
  image: string;
  badge?: string;
}

export const TEMPLATES: TemplateConfig[] = [];
