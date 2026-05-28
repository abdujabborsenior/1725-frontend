import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        neon: {
          green:  '#00f5a0',
          yellow: '#f5d000',
          pink:   '#ff3cac',
          blue:   '#00d2ff',
        },
      },
      backgroundImage: {
        'gradient-hero':   'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'gradient-brand':  'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
        'gradient-vibrant':'linear-gradient(135deg, #f5d000 0%, #00f5a0 50%, #00d2ff 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-neon':   'linear-gradient(135deg, #00f5a0 0%, #00d2ff 100%)',
      },
      boxShadow: {
        'glow-brand':  '0 0 40px rgba(99,102,241,0.35)',
        'glow-neon':   '0 0 40px rgba(0,245,160,0.3)',
        'glow-violet': '0 0 40px rgba(167,139,250,0.3)',
        'card':        '0 8px 32px rgba(0,0,0,0.4)',
        'card-hover':  '0 16px 48px rgba(0,0,0,0.5)',
        'glass':       'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: { xs: '2px' },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};

export default config;
