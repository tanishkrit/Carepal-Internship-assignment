/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0d9488', // Teal medical tone
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#13403d',
        },
        care: {
          blue: '#1e40af',
          sky: '#0284c7',
          soft: '#f8fafc',
          amber: '#d97706',
          rose: '#e11d48',
          emerald: '#059669'
        }
      }
    },
  },
  plugins: [],
}
