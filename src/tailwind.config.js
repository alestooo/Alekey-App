/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Esto es vital
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          900: '#1B4D3E',
          800: '#2D6A58',
        }
      }
    },
  },
  plugins: [],
}