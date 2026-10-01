/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#111511',
        surface: '#1a211b',
        raised: '#232c25',
        divider: '#303b33',
        paper: '#f4f4ec',
        muted: '#a4afa4',
        acid: '#c8ef70',
        coral: '#f28470',
        gold: '#efbc62',
        olive: '#809a70',
        teal: '#76b9a9',
      },
    },
  },
  plugins: [],
};