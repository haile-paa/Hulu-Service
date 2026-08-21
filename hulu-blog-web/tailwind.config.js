/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#081714',
        bg1: '#0c1f1b',
        bg2: '#102923',
        bg3: '#17362e',
        line: 'rgba(244,239,228,0.09)',
        line2: 'rgba(244,239,228,0.16)',
        cream: '#f4efe4',
        muted: '#93a7a0',
        muted2: '#6a7d77',
        teal: '#34c6a6',
        tealDim: '#1f5c4d',
        orange: '#fb9e30',
        orange2: '#e8811a',
      },
      fontFamily: {
        disp: ['"Space Grotesk"', '"Noto Sans Ethiopic"', 'sans-serif'],
        body: ['Inter', '"Noto Sans Ethiopic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        eth: ['"Noto Sans Ethiopic"', 'sans-serif'],
      },
      backgroundImage: {
        cta: 'linear-gradient(100deg, #fb9e30 0%, #34c6a6 100%)',
      },
      boxShadow: {
        glow: '0 8px 24px -8px rgba(251,158,48,0.45)',
      },
      maxWidth: {
        wrap: '1180px',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        marqueeSlow: 'marquee 50s linear infinite',
      },
    },
  },
  plugins: [],
}
