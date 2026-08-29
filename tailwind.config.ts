import type { Config } from 'tailwindcss';

/* ─────────────────────────────────────────────────────────────────────────
   MYMarkaz — iOS Design System (Apple)
   ─────────────────────────────────────────────────────────────────────────
   Ranglar Apple'ning system palitrasidan olingan (iOS 17 light mode), web
   uchun kontrast (WCAG AA) bo'yicha kalibrlangan: 500 = asl system rang,
   600/700 = oq matn yoki oq fondagi matn uchun AA-xavfsiz to'q variantlar.

   MUHIM: Tailwind'ning standart rang oilalari (slate/rose/amber/...) ATAYLAB
   qayta yozilgan — butun kod bazasi shu nomlarni ishlatadi, shuning uchun
   token almashtirish = butun mahsulot bir zumda iOS tiliga o'tadi.
   ───────────────────────────────────────────────────────────────────────── */

/** Apple neytral shkalasi — systemGray (iOS) + apple.com matn ranglari. */
const appleGray = {
  50: '#F9F9FB',
  100: '#F2F2F7', // systemGray6 — grouped background
  200: '#E5E5EA', // systemGray5 — hairline / fill
  300: '#D1D1D6', // systemGray4 — chegara
  400: '#8E8E93', // systemGray  — ikonka / placeholder (dekorativ)
  500: '#6E6E73', // ikkilamchi matn (AA: 5.0:1 oq fonda)
  600: '#515154',
  700: '#3A3A3C',
  800: '#2C2C2E',
  900: '#1D1D1F', // asosiy matn / to'q sirt
  950: '#000000',
};

/** systemBlue — mahsulotning YAGONA asosiy tint rangi (iOS qoidasi). */
const systemBlue = {
  50: '#EBF3FF',
  100: '#D6E7FF',
  200: '#ADCFFF',
  300: '#7DB2FF',
  400: '#3B92FF',
  500: '#007AFF', // iOS systemBlue
  600: '#0071E3', // oq matn uchun AA (4.6:1)
  700: '#0059B3', // oq fonda matn uchun AA (6.0:1)
  800: '#00448A',
  900: '#003370',
  DEFAULT: '#007AFF',
};

/** systemIndigo */
const systemIndigo = {
  50: '#EEEEFB',
  100: '#DEDDF8',
  200: '#C0BFF1',
  300: '#9C9AE8',
  400: '#7A78DE',
  500: '#5856D6',
  600: '#4B49C4',
  700: '#3E3CA6',
  800: '#323080',
  900: '#282766',
  DEFAULT: '#5856D6',
};

/** systemGreen — muvaffaqiyat, "onlayn", tasdiq. */
const systemGreen = {
  50: '#EAFBF0',
  100: '#CFF6DC',
  200: '#A0EDBB',
  300: '#6BE096',
  400: '#34C759', // iOS systemGreen
  500: '#30B94F',
  600: '#248A3D', // oq matn uchun AA
  700: '#1D7333',
  800: '#175C29',
  900: '#124821',
  DEFAULT: '#34C759',
};

/** systemRed — xato, destruktiv amal, "yoqdi" (heart). */
const systemRed = {
  50: '#FFEFEE',
  100: '#FFDCDA',
  200: '#FFB8B3',
  300: '#FF8E86',
  400: '#FF6259',
  500: '#FF3B30', // iOS systemRed
  600: '#E5271B', // oq matn uchun AA
  700: '#C21B10',
  800: '#9B160D',
  900: '#7A140D',
  DEFAULT: '#FF3B30',
};

/** systemOrange — ogohlantirish, kutish, "olov". */
const systemOrange = {
  50: '#FFF6E5',
  100: '#FFEBC7',
  200: '#FFD68F',
  300: '#FFC15C',
  400: '#FFAC2E',
  500: '#FF9500', // iOS systemOrange
  600: '#D97A00',
  700: '#A85E00', // oq fonda matn uchun AA
  800: '#804700',
  900: '#663900',
  DEFAULT: '#FF9500',
};

/** systemCyan / systemTeal — ma'lumot, ikkilamchi status. */
const systemCyan = {
  50: '#E9F7FE',
  100: '#CEEFFC',
  200: '#9CDFF8',
  300: '#66CBF1',
  400: '#32ADE6', // iOS systemCyan
  500: '#2196CC',
  600: '#177BAB',
  700: '#12638A',
  800: '#0E4E6D',
  900: '#0B3F58',
  DEFAULT: '#32ADE6',
};

/** systemPurple */
const systemPurple = {
  50: '#F7EDFC',
  100: '#EEDAF8',
  200: '#DCB6F1',
  300: '#C98BE8',
  400: '#AF52DE', // iOS systemPurple
  500: '#9B3FCB',
  600: '#8331AC',
  700: '#6B288D',
  800: '#552070',
  900: '#441A59',
  DEFAULT: '#AF52DE',
};

/** systemPink */
const systemPink = {
  50: '#FFEEF2',
  100: '#FFD9E1',
  200: '#FFB0C3',
  300: '#FF7F9E',
  400: '#FF2D55', // iOS systemPink
  500: '#EB1F46',
  600: '#C91535',
  700: '#A5102B',
  800: '#830C22',
  900: '#690A1B',
  DEFAULT: '#FF2D55',
};

/** systemTeal */
const systemTeal = {
  50: '#E7F7F9',
  100: '#C9EEF3',
  200: '#94DDE7',
  300: '#5CC7D6',
  400: '#30B0C7', // iOS systemTeal
  500: '#2496AB',
  600: '#1B7B8D',
  700: '#166374',
  800: '#114E5C',
  900: '#0E3F4A',
  DEFAULT: '#30B0C7',
};

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  /* `hover:` utilitalari FAQAT kursorli qurilmada qo'llanadi (@media (hover:hover)).
     Sensorli ekranda bosilgan element hover holatida "yopishib" qolmaydi — bu
     iOS charter qoidasi, endi butun kod bazasi uchun bir joyda kafolatlangan. */
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        /* ── Brend / neytral sirt va matn (Apple neytrallari) ───────── */
        brand: { ...appleGray, DEFAULT: appleGray[900] },

        /* ── Asosiy tint: systemBlue ────────────────────────────────── */
        accent: systemBlue,

        /* ── Ikkilamchi urg'u: systemIndigo (chat, ovoz berish) ─────── */
        iris: systemIndigo,

        /* ── Semantik iOS ranglari (nom-mos: mavjud kod ishlayveradi) ─ */
        slate: appleGray,
        gray: appleGray,
        zinc: appleGray,
        neutral: appleGray,
        stone: appleGray,
        green: systemGreen,
        emerald: systemGreen,
        lime: systemGreen,
        red: systemRed,
        rose: systemRed,
        orange: systemOrange,
        amber: systemOrange,
        yellow: systemOrange,
        sky: systemCyan,
        cyan: systemCyan,
        teal: systemTeal,
        blue: systemBlue,
        indigo: systemIndigo,
        violet: systemPurple,
        purple: systemPurple,
        fuchsia: systemPurple,
        pink: systemPink,

        /* ── iOS semantik nomlar (yangi kod uchun aniqroq) ──────────── */
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D55',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#30B0C7',
          cyan: '#32ADE6',
          yellow: '#FFCC00',
          mint: '#00C7BE',
          brown: '#A2845E',
          gray: '#8E8E93',
          gray2: '#AEAEB2',
          gray3: '#C7C7CC',
          gray4: '#D1D1D6',
          gray5: '#E5E5EA',
          gray6: '#F2F2F7',
        },

        /* ── Sirtlar (iOS background darajalari) ────────────────────── */
        surface: {
          DEFAULT: '#FFFFFF', // systemBackground
          soft: '#F2F2F7', // systemGroupedBackground
          muted: '#E5E5EA', // systemGray5
          elevated: '#FFFFFF', // secondarySystemGroupedBackground
        },

        /* ── iOS separator / fill (alfa — sirt ustida) ──────────────── */
        separator: {
          DEFAULT: 'rgba(60, 60, 67, 0.29)',
          opaque: '#C6C6C8',
        },
        fill: {
          DEFAULT: 'rgba(120, 120, 128, 0.20)',
          secondary: 'rgba(120, 120, 128, 0.16)',
          tertiary: 'rgba(118, 118, 128, 0.12)',
          quaternary: 'rgba(116, 116, 128, 0.08)',
        },
      },

      /* ── iOS tipografiya shkalasi (SF Pro / HIG) ──────────────────── */
      fontSize: {
        'large-title': ['2.125rem', { lineHeight: '2.5625rem', letterSpacing: '-0.024em' }],
        'title-1': ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.022em' }],
        'title-2': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.021em' }],
        'title-3': ['1.25rem', { lineHeight: '1.5625rem', letterSpacing: '-0.02em' }],
        headline: ['1.0625rem', { lineHeight: '1.375rem', letterSpacing: '-0.025em' }],
        body: ['1.0625rem', { lineHeight: '1.375rem', letterSpacing: '-0.025em' }],
        callout: ['1rem', { lineHeight: '1.3125rem', letterSpacing: '-0.02em' }],
        subhead: ['0.9375rem', { lineHeight: '1.25rem', letterSpacing: '-0.015em' }],
        footnote: ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '-0.006em' }],
        'caption-1': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0em' }],
        'caption-2': ['0.6875rem', { lineHeight: '0.8125rem', letterSpacing: '0.006em' }],
      },

      fontFamily: {
        sans: ['var(--font-ios)'],
        /* Yumaloq raqamlar/status uchun — SF Pro Rounded (Apple qurilmalari) */
        rounded: ['var(--font-ios-rounded)'],
      },

      /* ── iOS burchak radiuslari (continuous corner qiymatlari) ────── */
      borderRadius: {
        ios: '0.625rem', // 10 — list qatori / kichik karta
        'ios-md': '0.75rem', // 12 — tugma / input
        'ios-lg': '0.875rem', // 14 — inset grouped karta
        'ios-xl': '1rem', // 16 — karta
        'ios-2xl': '1.25rem', // 20 — katta karta
        'ios-3xl': '1.625rem', // 26 — sheet / modal
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* ── Soyalar — iOS sirtlari deyarli tekis, sheet'lar chuqur ───── */
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 6px 20px -4px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.04)',
        soft: '0 1px 3px rgba(0, 0, 0, 0.05)',
        lift: '0 10px 34px -10px rgba(0, 0, 0, 0.16)',
        modal: '0 24px 68px -12px rgba(0, 0, 0, 0.28)',
        sheet: '0 -10px 44px -12px rgba(0, 0, 0, 0.18)',
        /* Segmented control tugmasi — iOS'ning aynan o'zi */
        segment: '0 3px 8px rgba(0, 0, 0, 0.12), 0 3px 1px rgba(0, 0, 0, 0.04)',
        'glow-accent': '0 6px 20px -4px rgba(0, 122, 255, 0.35)',
        'glow-iris': '0 6px 20px -4px rgba(88, 86, 214, 0.35)',
        'glow-brand': '0 6px 20px -6px rgba(0, 0, 0, 0.24)',
        'glow-emerald': '0 6px 20px -4px rgba(52, 199, 89, 0.32)',
        'glow-emerald-lg': '0 12px 34px -8px rgba(52, 199, 89, 0.38)',
        'ring-accent': '0 0 0 4px rgba(0, 122, 255, 0.18)',
      },

      backgroundImage: {
        'gradient-hero': 'linear-gradient(180deg, #FFFFFF 0%, #F2F2F7 100%)',
        'gradient-brand': 'linear-gradient(180deg, #2C2C2E 0%, #1D1D1F 100%)',
        'gradient-accent': 'linear-gradient(180deg, #0A84FF 0%, #007AFF 100%)',
        'gradient-iris': 'linear-gradient(180deg, #6C6AE0 0%, #5856D6 100%)',
        /* iMessage ko'k — chiquvchi xabar pufagi */
        'gradient-imessage': 'linear-gradient(180deg, #2A9BFF 0%, #007AFF 100%)',
        'gradient-emerald-iris': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        'gradient-text-brand': 'linear-gradient(180deg, #3A3A3C 0%, #1D1D1F 100%)',
        mesh: `radial-gradient(at 0% 0%, rgba(0,122,255,0.07) 0px, transparent 55%),
               radial-gradient(at 100% 0%, rgba(88,86,214,0.06) 0px, transparent 55%)`,
      },

      transitionTimingFunction: {
        /* iOS'ning standart interfeys egri chizig'i (sheet, push, tab) */
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
        'ios-out': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ios-spring': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      },

      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },

      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.25,0.1,0.25,1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
        'slide-down': 'slideDown 0.28s cubic-bezier(0.32,0.72,0,1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.32,0.72,0,1)',
        'pop-in': 'popIn 0.24s cubic-bezier(0.34,1.3,0.64,1)',
        /* iOS sheet — pastdan ko'tarilish */
        'sheet-up': 'sheetUp 0.42s cubic-bezier(0.32,0.72,0,1)',
        /* iOS alert — markazdan */
        'alert-in': 'alertIn 0.28s cubic-bezier(0.32,0.72,0,1)',
        shimmer: 'shimmer 1.4s linear infinite',
        'msg-in': 'msgIn 0.28s cubic-bezier(0.32,0.72,0,1)',
        marquee: 'marquee 42s linear infinite',
        'spin-slow': 'spin 18s linear infinite',
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4,0,0.6,1) infinite',
        /* Eski nomlar — sinmasligi uchun saqlandi (iOS'da tinch) */
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        aurora: 'float 12s ease-in-out infinite',
        blob: 'float 12s ease-in-out infinite',
        'gradient-pan': 'fadeIn 0.25s ease-out',
        shine: 'shine 5s ease-in-out infinite',
        'fab-ring': 'fabRing 3s cubic-bezier(0.32,0.72,0,1) infinite',
      },

      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.86)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        sheetUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        alertIn: {
          from: { opacity: '0', transform: 'scale(1.12)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        msgIn: {
          from: { opacity: '0', transform: 'translateY(6px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-130%) skewX(-12deg)' },
          '55%, 100%': { transform: 'translateX(230%) skewX(-12deg)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.85)' },
        },
        fabRing: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '70%, 100%': { transform: 'scale(1.45)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
