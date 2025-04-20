/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        'navbar': '64px', // 4rem or 64px
      }
    },
  },
  plugins: [],
};
