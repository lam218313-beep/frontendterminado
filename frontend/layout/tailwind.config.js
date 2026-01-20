/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Design Tokens: Border Radius
            borderRadius: {
                'card': '32px',
                'container': '40px',
                'button': '16px',
                'input': '12px',
                'badge': '8px',
            },

            // Design Tokens: Spacing
            spacing: {
                '18': '4.5rem',   // 72px
                '88': '22rem',    // 352px (sidebar collapsed)
                '128': '32rem',   // 512px
            },

            // Design Tokens: Colors
            colors: {
                'brand-bg': '#F8F9FA',
                'brand-dark': '#1E293B',
                'primary': {
                    50: '#FFF0F7',
                    100: '#FFE0F0',
                    200: '#FFC2E1',
                    300: '#FFA3D2',
                    400: '#FF85C3',
                    500: '#F20F79',
                    600: '#D10C68',
                    700: '#B00957',
                    800: '#8F0746',
                    900: '#6E0535',
                },
                'chart': {
                    red: '#EF4444',
                    yellow: '#F59E0B',
                    green: '#10B981',
                    blue: '#3B82F6',
                },
            },

            // Documented Breakpoints
            screens: {
                'xs': '475px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
    },
    plugins: [
        // Custom scrollbar utilities
        function ({ addUtilities }) {
            addUtilities({
                '.scrollbar-thin': {
                    'scrollbar-width': 'thin',
                },
                '.scrollbar-thumb-gray-300': {
                    'scrollbar-color': '#D1D5DB transparent',
                },
                '.scrollbar-track-transparent': {
                    'scrollbar-color': 'transparent transparent',
                },
            });
        },
    ],
}
