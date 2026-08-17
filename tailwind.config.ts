import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 漢方・和のイメージ（deep herb green + warm sand）
        kampo: {
          50: '#f3f7f2',
          100: '#e2ebdf',
          200: '#c4d7bf',
          300: '#9dbb96',
          400: '#729a6a',
          500: '#527d4a',
          600: '#3d6438',
          700: '#31502e',
          800: '#294027',
          900: '#233622',
        },
        sand: {
          50: '#fbf8f3',
          100: '#f4ede0',
          200: '#e8d9c2',
          300: '#d8be99',
          400: '#c69f70',
          500: '#b98a55',
          600: '#a5734a',
          700: '#895b3f',
          800: '#704b38',
          900: '#5d4031',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
};

export default config;
