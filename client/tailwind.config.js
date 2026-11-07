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
        glass: {
          bg: 'var(--glass-bg)',
          card: 'var(--glass-card)',
          border: 'var(--glass-border)',
          highlight: 'var(--glass-highlight)',
          text: 'var(--glass-text)',
          muted: 'var(--glass-muted)'
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        risk: {
          low: '#10b981',
          medium: '#3b82f6',
          high: '#f59e0b',
          critical: '#ef4444'
        }
      },
      boxShadow: {
        'glass-sm': '0 2px 8px 0 var(--glass-shadow)',
        'glass-md': '0 8px 32px 0 var(--glass-shadow)',
        'glass-lg': '0 16px 48px 0 var(--glass-shadow)',
        'glass-specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 8px 32px 0 var(--glass-shadow)'
      },
      backdropBlur: {
        'glass-xs': '4px',
        'glass-sm': '8px',
        'glass-md': '16px',
        'glass-lg': '24px',
        'glass-xl': '40px'
      }
    },
  },
  plugins: [],
}

