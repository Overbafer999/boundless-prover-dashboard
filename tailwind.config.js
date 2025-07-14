/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Главные неоновые и фоновые цвета для всех акцентов!
        'boundless-accent': '#38fff6',
        'boundless-neon': '#b840f4',
        'boundless-success': '#48ffab',
        'boundless-card': '#151828',
        'boundless-bg': '#0a1120',
        // Старая nested схема — можно оставить для обратной совместимости
        boundless: {
          bg: "#151226",
          card: "#23203a",
          neon: "#8b5cf6",
          accent: "#6366f1",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444"
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      dropShadow: {
        neon: '0 0 10px #38fff6, 0 0 20px #b840f4',
        soft: '0 4px 24px #38fff655',
        white: '0 2px 18px #fff9',
      },
      boxShadow: {
        neon: '0 0 32px 8px #38fff688, 0 0 64px 8px #b840f488',
        'neon-xs': '0 0 7px #38fff6cc, 0 0 12px #b840f4aa',
        glass: '0 2px 32px 0 #38fff622',
      },
      backgroundImage: {
        'neon-glow': 'linear-gradient(120deg, #38fff6 0%, #b840f4 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'card-bg': 'linear-gradient(135deg, rgba(56,255,246,0.10) 0%, rgba(184,64,244,0.10) 100%)'
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'neon-pulse': {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 12px #38fff6) drop-shadow(0 0 20px #b840f4)'
          },
          '50%': {
            filter: 'drop-shadow(0 0 28px #38fff6) drop-shadow(0 0 36px #b840f4)'
          },
        }
      }
    },
  },
  plugins: [],
}
