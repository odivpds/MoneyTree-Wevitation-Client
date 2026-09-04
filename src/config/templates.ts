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
  features?: any;
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
}

export const TEMPLATES: TemplateConfig[] = [];
