/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cute-pink': '#ffdeeb',
                'cute-mint': '#e0fcf2',
                'cute-lavender': '#f3e8ff',
                'cute-yellow': '#fef9c3',
                'cute-primary': '#ff7eb6',
                'cute-dark': '#4a3f44',
                'cute-text-light': '#a18e96',
                primary: {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d',
                    900: '#831843',
                },
            },
            animation: {
                'bubble': 'bubble 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                bubble: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(15px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '3rem',
            },
            boxShadow: {
                'cute': '0 10px 25px -5px rgba(255, 126, 182, 0.15), 0 8px 10px -6px rgba(255, 126, 182, 0.1)',
            }
        },
    },
    plugins: [],
}
