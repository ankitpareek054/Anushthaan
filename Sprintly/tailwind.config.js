/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
      },
      colors: {
        customBg: '#FBFCF8',
      },
      fontFamily: {
        helvetica: ['Helvetica', 'Arial', 'sans-serif'], // Added Helvetica properly
        amaranth: ['Amaranth', 'sans-serif'],
      },
    },
    fontFamily: {
      sans: ['Helvetica', 'Arial', 'sans-serif'], // Set Helvetica as default
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('tailwind-scrollbar'),
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none',    /* Firefox */
        },
        '.no-scrollbar::-webkit-scrollbar': {
          'display': 'none',            /* Safari and Chrome */
        },
      });
    },
  ],
};


module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [ require('tailwind-scrollbar'),require('tailwind-scrollbar-hide')],
};
  
// module.exports = {
//   darkMode: 'class', // Enables manual dark mode toggle
//   content: ["./src//*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],



