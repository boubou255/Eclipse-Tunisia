/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#04050c',
          900: '#080a17',
          800: '#0e1226',
          700: '#161b35',
          600: '#222949',
          500: '#323a63',
        },
        corona: {
          50: '#fff8e6',
          100: '#ffefc2',
          200: '#ffe08a',
          300: '#fbcf5a',
          400: '#f5c043',
          500: '#e2a72a',
          600: '#b9831c',
        },
        ember: '#f08a3c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        corona: '0 0 40px 8px rgba(245, 192, 67, 0.35), 0 0 120px 30px rgba(245, 192, 67, 0.15)',
        card: '0 10px 30px -10px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 40px 8px rgba(245,192,67,0.35), 0 0 120px 30px rgba(245,192,67,0.12)' },
          '50%': { boxShadow: '0 0 55px 14px rgba(245,192,67,0.45), 0 0 160px 45px rgba(245,192,67,0.18)' },
        },
      },
      animation: {
        // 'backwards' (not 'both') so no transform remains afterwards: a leftover transform
        // would turn fixed-position children (bottom bar, bottom sheet) into absolute ones.
        fadeUp: 'fadeUp .45s ease-out backwards',
        slideUp: 'slideUp .3s ease-out backwards',
        pulseGlow: 'pulseGlow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
