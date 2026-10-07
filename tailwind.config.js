/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        hive: {
          cream: '#FFF9ED',
          honey: '#F6C344',
          'honey-light': '#FADD7A',
          'honey-dark': '#D4A020',
          leaf: '#67A85B',
          'leaf-deep': '#376847',
          'leaf-light': '#8BC97F',
          sky: '#A9D9EA',
          coral: '#F28C72',
          lavender: '#B7A6DD',
          ink: '#25352D',
          'ink-light': '#4A5E54',
          'ink-muted': '#7A8E84',
          warm: '#F5EDE0',
          earth: '#C4A882',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'hive-sm': '10px',
        'hive-md': '16px',
        'hive-lg': '24px',
        'hive-pill': '999px',
      },
      boxShadow: {
        'hive-soft': '0 8px 30px rgba(37, 53, 45, 0.08)',
        'hive-float': '0 14px 40px rgba(37, 53, 45, 0.12)',
        'hive-glow': '0 0 20px rgba(246, 195, 68, 0.3)',
      },
      transitionTimingFunction: {
        'hive-gentle': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'hive-bob': 'hiveBob 2s ease-in-out infinite',
        'hive-sway': 'hiveSway 3s ease-in-out infinite',
        'hive-pulse-soft': 'hivePulseSoft 3s ease-in-out infinite',
        'hive-float': 'hiveFloat 4s ease-in-out infinite',
        'hive-spin-slow': 'hiveSpinSlow 8s linear infinite',
      },
      keyframes: {
        hiveBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        hiveSway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        hivePulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        hiveFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-2px) rotate(1deg)' },
          '75%': { transform: 'translateY(2px) rotate(-1deg)' },
        },
        hiveSpinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}