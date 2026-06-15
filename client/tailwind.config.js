/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        society: {
          primary: '#0A1628',   // Deep Navy
          secondary: '#D4AF37', // Royal Gold
          accent: '#F5F7FA',    // Light Slate
          success: '#22C55E',   // Green
          danger: '#EF4444',    // Red
          gold: {
            DEFAULT: '#D4AF37',
            dark: '#AA820A',
            light: '#F0CB55',
          },
          navy: {
            DEFAULT: '#0A1628',
            deep: '#060F1C',
            mid: '#0F1F3D',
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      scale: {
        '108': '1.08',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shimmer-gold': 'shimmer-gold 4s linear infinite',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer-gold': {
          '0%': { 'background-position': '-200% center' },
          '100%': { 'background-position': '200% center' },
        }
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
