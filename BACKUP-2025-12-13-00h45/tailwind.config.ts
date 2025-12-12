import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2540',
          light: '#1a3a5f',
          dark: '#061729',
        },
        blue: {
          DEFAULT: '#0066CC',
        },
        gold: {
          DEFAULT: '#C9A961',
          light: '#E5D4A6',
        },
        dark: {
          bg: '#0D1117',
          surface: '#161B22',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
