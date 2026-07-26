import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F1014', // Rich deep midnight slate
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          subtle: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.12)',
          glass: 'rgba(255, 255, 255, 0.05)',
        },
        brand: {
          DEFAULT: '#E04F33', // Kaizen Capital Burnt Orange / Terracotta
          hover: '#ED5B3F',
          active: '#C73E24',
          muted: 'rgba(224, 79, 51, 0.15)',
          glow: 'rgba(224, 79, 51, 0.3)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.20)',
          brand: 'rgba(224, 79, 51, 0.40)',
        },
        accent: {
          DEFAULT: '#E04F33',
          hover: '#ED5B3F',
          muted: 'rgba(224, 79, 51, 0.15)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E2E8F0',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'apple-glass': '0 20px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 28px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.16)',
        subtle: '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;

