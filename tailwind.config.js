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
        vault: {
          darkest: '#050811',
          bg: '#080D1A',
          card: '#0D1527',
          'card-hover': '#121D36',
          border: '#1E293B',
          'border-light': '#334155',
          accent: '#8B5CF6',
          'accent-light': '#A78BFA',
          cyan: '#06B6D4',
          'cyan-light': '#38BDF8',
          success: '#10B981',
          'success-glow': '#059669',
          warning: '#F59E0B',
          'warning-glow': '#D97706',
          danger: '#EF4444',
          'danger-glow': '#DC2626',
          muted: '#64748B',
          subtle: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'glow-violet': 'glowViolet 2s ease-in-out infinite alternate',
        'flow-line': 'flowLine 1.5s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2), 0 0 10px rgba(6, 182, 212, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.3)' },
        },
        glowViolet: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.2), 0 0 10px rgba(139, 92, 246, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.3)' },
        },
        flowLine: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
