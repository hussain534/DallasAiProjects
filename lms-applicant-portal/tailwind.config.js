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
          DEFAULT: '#1e3a5f',
          dark: '#152a45',
          light: '#2d4a6f',
        },
        accent: {
          purple: '#4a1942',
          magenta: '#7b2d5b',
        },
        success: {
          DEFAULT: '#2d5a3d',
          light: '#3d6a4d',
        },
      },
      backgroundImage: {
        'gradient-offer': 'linear-gradient(135deg, #4a1942, #7b2d5b)',
      },
    },
  },
  plugins: [],
}
