// Multi-template system - stores theme presets for sale
import type { ThemeConfig } from './types';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    gold: string;
    terracotta: string;
  };
  fontHeading: string;
  fontBody: string;
  cardRadius: number;
  ornamentStyle: 'leaves' | 'floral' | 'geometric' | 'minimal';
  ornamentDensity: 'low' | 'medium' | 'high';
  animationIntensity: 'subtle' | 'medium' | 'vibrant';
  isPremium: boolean;
}

export const templatePresets: TemplatePreset[] = [
  {
    id: 'modern-organic-luxury',
    name: 'Modern Organic Luxury',
    description: 'Elegan alami dengan sentuhan emas, sage, dan forest green. Cocok untuk outdoor & garden wedding.',
    thumbnail: '🎋',
    colors: { primary: '#22382D', secondary: '#6F7F55', accent: '#A9B89B', bg: '#F7F1E6', text: '#22382D', gold: '#C9A86A', terracotta: '#B86B4B' },
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    cardRadius: 24,
    ornamentStyle: 'leaves',
    ornamentDensity: 'medium',
    animationIntensity: 'medium',
    isPremium: false,
  },
  {
    id: 'classic-rose-gold',
    name: 'Classic Rose Gold',
    description: 'Romantis dan anggun dengan palet dusty pink, rose gold, dan cream. Cocok untuk ballroom.',
    thumbnail: '🌹',
    colors: { primary: '#8B5E63', secondary: '#D4A9A7', accent: '#E8D5C4', bg: '#FEFAF6', text: '#4A3B3C', gold: '#D4A9A7', terracotta: '#C4918C' },
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    cardRadius: 20,
    ornamentStyle: 'floral',
    ornamentDensity: 'high',
    animationIntensity: 'vibrant',
    isPremium: true,
  },
  {
    id: 'minimal-monochrome',
    name: 'Minimal Monochrome',
    description: 'Simpel modern dengan palet monokrom hangat. Cocok untuk intimate & modern wedding.',
    thumbnail: '⬜',
    colors: { primary: '#2D2D2D', secondary: '#6B6B6B', accent: '#A0A0A0', bg: '#FAFAFA', text: '#1A1A1A', gold: '#D4AF37', terracotta: '#C0A080' },
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Inter',
    cardRadius: 12,
    ornamentStyle: 'minimal',
    ornamentDensity: 'low',
    animationIntensity: 'subtle',
    isPremium: true,
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    description: 'Ceria dan segar dengan palet hijau tropis, coral, dan putih. Cocok untuk beach & destination wedding.',
    thumbnail: '🌴',
    colors: { primary: '#1B4332', secondary: '#40916C', accent: '#52B788', bg: '#F0F7F4', text: '#1B4332', gold: '#D4A373', terracotta: '#E76F51' },
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    cardRadius: 28,
    ornamentStyle: 'leaves',
    ornamentDensity: 'high',
    animationIntensity: 'vibrant',
    isPremium: true,
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Mewah dan dramatis dengan ungu, gold, dan hitam. Cocok untuk evening & formal wedding.',
    thumbnail: '💜',
    colors: { primary: '#2D1B4E', secondary: '#6B3FA0', accent: '#9B7FC1', bg: '#F8F5FC', text: '#1A1030', gold: '#D4AF37', terracotta: '#C4A882' },
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    cardRadius: 16,
    ornamentStyle: 'geometric',
    ornamentDensity: 'medium',
    animationIntensity: 'medium',
    isPremium: true,
  },
];

export function getTemplateById(id: string): TemplatePreset | undefined {
  return templatePresets.find(t => t.id === id);
}

export function applyTemplateToTheme(template: TemplatePreset): ThemeConfig {
  return {
    primaryColor: template.colors.primary,
    secondaryColor: template.colors.secondary,
    accentColor: template.colors.accent,
    bgColor: template.colors.bg,
    textColor: template.colors.text,
    goldColor: template.colors.gold,
    fontHeading: template.fontHeading,
    fontBody: template.fontBody,
    cardRadius: template.cardRadius,
    ornamentDensity: template.ornamentDensity,
    animationIntensity: template.animationIntensity,
  };
}
