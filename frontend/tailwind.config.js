/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16'
        },
        earth: {
          50: '#fdf8f0', 100: '#fbefd9', 200: '#f6ddb0',
          300: '#f0c47e', 400: '#e9a44a', 500: '#e28929',
          600: '#d3701e', 700: '#b05519', 800: '#8e4419', 900: '#743918', 950: '#3e1c09'
        },
        soil: {
          50: '#faf7f5', 100: '#f3ece7', 200: '#e9d9cf',
          300: '#d6bfb0', 400: '#bc9c88', 500: '#a57d67',
          600: '#93664f', 700: '#7a5342', 800: '#664640', 900: '#563d38', 950: '#2e1e1c'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Serif Devanagari"', 'serif']
      },
      backgroundImage: {
        'agri-gradient': 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)',
        'gold-gradient': 'linear-gradient(135deg, #92400e 0%, #b45309 40%, #d97706 70%, #f59e0b 100%)',
        'earth-gradient': 'linear-gradient(135deg, #fdf8f0 0%, #fbefd9 100%)',
      },
      boxShadow: {
        'agri': '0 4px 24px rgba(5, 46, 22, 0.15)',
        'agri-lg': '0 8px 48px rgba(5, 46, 22, 0.2)',
        'earth': '0 4px 24px rgba(226, 137, 41, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'leaf': 'leaf 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 1.5s steps(3) infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-green': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' } },
        leaf: { '0%, 100%': { transform: 'rotate(-5deg) translateY(0)' }, '25%': { transform: 'rotate(5deg) translateY(-5px)' }, '50%': { transform: 'rotate(-3deg) translateY(2px)' }, '75%': { transform: 'rotate(3deg) translateY(-3px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        typing: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      }
    }
  },
  plugins: []
}
