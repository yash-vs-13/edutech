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
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
          }
        },
        keyframes: {
          'slide-in': {
            '0%': {
              opacity: '0',
              transform: 'translate(-50%, -60%)',
            },
            '100%': {
              opacity: '1',
              transform: 'translate(-50%, -50%)',
            },
          },
        },
        animation: {
          'slide-in': 'slide-in 0.3s ease-out',
        },
      },
    },
    plugins: [],
  }