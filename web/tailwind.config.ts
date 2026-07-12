import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#5B9BD5',
          50: '#F0F7FC',
          100: '#D6EAF8',
          200: '#AED6F1',
          300: '#85C1E9',
          400: '#5DADE2',
          500: '#5B9BD5',
          600: '#3498DB',
          700: '#2E86C1',
          800: '#2874A6',
          900: '#1B4F72',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
        },
      },
    },
  },
  plugins: [],
}

export default config
