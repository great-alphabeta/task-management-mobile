/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5F33E1',
        secondary: '#6E6A7C',
        black: '#24252C',
        white: '#FAFAFA',
      },
      fontFamily: {
        lexend: ['LexendDeca_400Regular'],
      },
      fontSize: {
        'sm': ['11px'],
        'base': ['14px'],
        'lg': ['19px'],
        'xl': ['24px'],
        '2xl': ['33px'],
        '3xl': ['44px'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
    },
  },
  plugins: [],
};
