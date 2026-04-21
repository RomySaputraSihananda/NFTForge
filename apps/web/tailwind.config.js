/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './../../node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    './../../node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f5ff',
          purple: '#b44fff',
          pink: '#ff2d78',
          gold: '#ffd700',
          green: '#00ff88',
        },
        void: {
          DEFAULT: '#030712',
          dark: '#020912',
          card: '#0a1628',
          card2: '#0d1f36',
          surface: '#050e1a',
        },
        dim: '#4a7fa8',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
        syne: ['Syne', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.1em' }],
        '3xs': ['9px', { lineHeight: '12px', letterSpacing: '0.15em' }],
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },
      borderRadius: {
        px: '2px',
        sm: '3px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.3)',
        'neon-purple': '0 0 20px #b44fff, 0 0 40px rgba(180,79,255,0.3)',
        'neon-pink': '0 0 20px #ff2d78, 0 0 40px rgba(255,45,120,0.3)',
        'glow-sm': '0 0 10px rgba(0,245,255,0.4)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(90deg, #00f5ff, #b44fff)',
        'gradient-hero':
          'linear-gradient(135deg, #050e1a 0%, #0a0520 50%, #050e1a 100%)',
        'gradient-card':
          'linear-gradient(90deg, rgba(0,245,255,0.06), transparent)',
        'gradient-void': 'linear-gradient(180deg, #040d1a 0%, #020912 100%)',
        'gradient-bar': 'linear-gradient(180deg, #b44fff, #00f5ff)',
        'gradient-overlay':
          'linear-gradient(180deg, transparent 40%, rgba(3,7,18,0.9) 100%)',
      },
      keyframes: {
        glitch: {
          '0%, 90%, 100%': { textShadow: 'none', transform: 'none' },
          '92%': {
            textShadow: '-2px 0 #ff2d78, 2px 0 #00f5ff',
            transform: 'skewX(-1deg)',
          },
          '94%': {
            textShadow: '2px 0 #ff2d78, -2px 0 #00f5ff',
            transform: 'skewX(1deg)',
          },
          '96%': { textShadow: 'none', transform: 'none' },
        },
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,245,255,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(0,245,255,0)' },
        },
        'card-in': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        glitch: 'glitch 4s infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'card-in': 'card-in 0.4s ease forwards',
        blink: 'blink 1.2s ease infinite',
      },
    },
  },
  plugins: [],
};
