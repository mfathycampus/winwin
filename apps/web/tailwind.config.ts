import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#dde6ff',
          200: '#c3d0fe',
          500: '#2B5CB8',
          600: '#1E3F8A',
          700: '#163072',
          900: '#0E1F4A',
        },
        gold: {
          50:  '#fdf8ee',
          100: '#faefd0',
          400: '#D4A843',
          500: '#C9922A',
          600: '#A8771E',
          700: '#8A6018',
        },
        brand: {
          blue:     '#1B3A7A',   // main navy blue
          blueDark: '#0E2254',   // darker navy
          gold:     '#C9922A',   // main gold
          goldLight:'#D4A843',   // lighter gold
          bg:       '#F5F3EE',   // cream background (from logo)
        },
        border: '#e5e7eb',
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
