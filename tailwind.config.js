/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",          // <-- Add this line explicitly
    "./**/*.{html,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}