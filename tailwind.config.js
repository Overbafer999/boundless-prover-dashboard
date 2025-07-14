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
        neon: '0 0 10px #8b5cf6, 0 0 20px #6366f1',
      },
      backgroundImage: {
        'neon-glow': 'linear-gradient(120deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
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
            filter: 'drop-shadow(0 0 10px #8b5cf6) drop-shadow(0 0 20px #6366f1)' 
          },
          '50%': { 
            filter: 'drop-shadow(0 0 20px #8b5cf6) drop-shadow(0 0 30px #6366f1)' 
          },
        }
      }
    },
  },
  plugins: [],
}
