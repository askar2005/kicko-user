/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3A8F73',
          dark: '#327D64',
          light: '#6FB7A1',
        },
        sports: {
          bg: '#F7FAF9',
          'bg-light': '#F7FAF9',
          'bg-gradient': 'linear-gradient(135deg, #F7FAF9, #EEF3F1)',
        },
        text: {
          heading: '#1E2A27',
          primary: '#1E2A27',
          secondary: '#6A7C76',
          description: '#6A7C76',
          label: '#6A7C76',
          title: '#1E2A27',
        },
        card: {
          bg: '#FFFFFF',
          border: '#E6ECEA',
        },
        input: {
          bg: '#FBFDFC',
          border: '#E3EAE7',
        },
        'secondary-btn': {
          bg: '#E8F2EE',
          text: '#3A8F73',
        },
        nav: {
          bg: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
