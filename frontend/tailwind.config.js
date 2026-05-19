/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Brand coral/red accent ──────────────────────────
        coral: {
          400: '#f07070',
          500: '#e8445a',
          600: '#d03050',
          700: '#b02040',
        },
        // ── Dark navy backgrounds ───────────────────────────
        navy: {
          500: 'rgba(255,255,255,0.08)',
          600: 'rgba(255,255,255,0.05)',
          700: '#0d1520',
          800: '#0a1018',
          900: '#060c12',
        },
        // ── Teal/green primary ──────────────────────────────
        primary:   '#004D4D',
        secondary: '#0a5d58',
        // ── Text shades ─────────────────────────────────────
        fitpro: {
          text:  '#e2e8f0',
          muted: '#94a3b8',
        },
        // ── Light mode ──────────────────────────────────────
        light: {
          text:   '#212529',
          muted:  '#6c757d',
          border: 'rgba(0,77,77,0.12)',
        },
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #004D4D 0%, #0a5d58 48%, #A3B18A 100%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(10,93,88,0.4) 0%, rgba(0,77,77,0.2) 100%)',
      },
      boxShadow: {
        coral:      '0 4px 20px rgba(232,68,90,0.35)',
        glow:       '0 0 30px rgba(232,68,90,0.20)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.25)',
        glass:      '0 8px 32px rgba(0,0,0,0.30)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xl: '20px',
      },
      scale: {
        102: '1.02',
      },
    },
  },
  plugins: [],
}
