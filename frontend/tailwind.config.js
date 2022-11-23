/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        backgroundImage: {
            'login_bg': "url('images/login_bg.jpg')",
            'register_bg': "url('images/register_bg.jpg')",
        },
        colors: {
            brown: {
                50:  '#DE9E48',
                100: '#7A431D',
                200: '#563727',
                300: '#372C2E',
                400: '#29191A',
                500: '#1F1616',
                600: '#D2735C',
                700: '#241B19',
            }   
        }
    },
  },
  plugins: [],
}