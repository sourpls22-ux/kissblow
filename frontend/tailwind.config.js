/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        'onlyfans': {
          'accent': '#00aff0',
          'dark': '#1A1A1A',
          'gray': '#2A2A2A',
          'light-gray': '#3A3A3A',
          // Light theme colors
          'light-bg': '#FFFFFF',
          'light-surface': '#F8F9FA',
          'light-border': '#E5E7EB',
          'light-text': '#1F2937',
          'light-text-secondary': '#6B7280'
        }
      }
    },
  },
  plugins: [],
}
