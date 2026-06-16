import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — to'q ko'k (navy / slate). Asosiy brend rangi.
        brand: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0a192f',
          950: '#020617',
          DEFAULT: '#0a192f',
        },
        // Accent — emerald. CTA va g'olib status uchun.
        accent: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#10b981',
        },
        // Iris — indigo/binafsha ikkilamchi accent. Chat, gradientlar, chuqurlik.
        iris: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#6366f1',
        },
        // Surface — bloklar uchun
        surface: {
          DEFAULT: '#ffffff',
          soft:    '#f6f8fb',
          muted:   '#eef2f7',
        },
      },
      backgroundImage: {
        'gradient-hero':   'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #ecfdf5 100%)',
        'gradient-brand':  'linear-gradient(135deg, #0a192f 0%, #1e293b 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-iris':   'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        'gradient-emerald-iris': 'linear-gradient(120deg, #10b981 0%, #6366f1 100%)',
        'gradient-text-brand': 'linear-gradient(135deg, #0a192f 0%, #475569 100%)',
        // Signature mesh — bosh sahifa va premium bloklar uchun
        'mesh': `radial-gradient(at 0% 0%, rgba(16,185,129,0.10) 0px, transparent 50%),
                 radial-gradient(at 98% 2%, rgba(99,102,241,0.10) 0px, transparent 50%),
                 radial-gradient(at 50% 100%, rgba(52,211,153,0.08) 0px, transparent 50%)`,
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 28px rgba(15, 23, 42, 0.10), 0 4px 10px rgba(15, 23, 42, 0.05)',
        'soft':       '0 2px 8px rgba(15, 23, 42, 0.05)',
        'lift':       '0 18px 40px -12px rgba(15, 23, 42, 0.18)',
        'modal':      '0 25px 50px -12px rgba(15, 23, 42, 0.22)',
        'glow-accent':'0 8px 28px rgba(16, 185, 129, 0.30)',
        'glow-iris':  '0 8px 28px rgba(99, 102, 241, 0.30)',
        'glow-brand': '0 8px 24px rgba(10, 25, 47, 0.18)',
        'ring-accent':'0 0 0 3px rgba(16,185,129,0.15)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.18s ease-out',
        'pop-in':     'popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':    'shimmer 1.6s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'msg-in':     'msgIn 0.22s cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        popIn:     { '0%': { opacity: '0', transform: 'scale(0.8)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        msgIn:     { from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
      },
    },
  },
  plugins: [],
};

export default config;
