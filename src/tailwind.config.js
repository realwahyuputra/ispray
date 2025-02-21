/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ios-system': '#F2F2F7', // iOS System Background Color
        'ios-secondary-system': '#FFFFFF', // iOS Secondary System Background Color
        'ios-label': '#000000', // iOS Label Color
        'ios-secondary-label': '#8E8E93', // iOS Secondary Label Color
        'ios-system-blue': '#aa6ab8', // iOS System Purple Color
        'ios-system-gray': '#D1D1D6', // iOS System Gray Color
        'ios-system-gray2': '#E5E5EA', // iOS System Gray 2 Color
        'ios-system-gray3': '#EFEFF4', // iOS System Gray 3 Color
        'ios-separator': '#C6C6C8', // iOS Separator Color
      },
      fontFamily: {
        'sf-pro': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
