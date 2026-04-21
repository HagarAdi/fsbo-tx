/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          700: '#15803d',
          600: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}
