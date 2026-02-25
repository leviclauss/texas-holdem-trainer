/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          900: '#0f1923',
          800: '#1a2634',
          700: '#243447',
          600: '#2e4459',
        },
        accent: {
          green: '#2d6a4f',
          'green-light': '#40916c',
          gold: '#f0c040',
          'gold-dark': '#d4a017',
        },
        card: {
          red: '#e53e3e',
          black: '#1a202c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
