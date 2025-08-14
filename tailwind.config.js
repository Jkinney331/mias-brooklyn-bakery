/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brooklyn location theme - Teal & Ocean inspired
        'brooklyn': {
          50: '#f0f9fa',
          100: '#d9f2f4',
          200: '#b8e6ea',
          300: '#87d4db',
          400: '#5A9FA8',
          500: '#5A9FA8',
          600: '#4a8289',
          700: '#3d6b71',
          800: '#35575c',
          900: '#2f4a4e',
          950: '#1c2e32',
        },
        // Upper East Side theme - Warm gold & sophisticated
        'ues': {
          50: '#fdf8f1',
          100: '#f9efde',
          200: '#f2ddbc',
          300: '#e8c490',
          400: '#D4A574',
          500: '#D4A574',
          600: '#c1925e',
          700: '#a07a4f',
          800: '#826246',
          900: '#6b523b',
          950: '#392a1e',
        },
        // Times Square theme - Purple & vibrant
        'times-square': {
          50: '#faf9fb',
          100: '#f3f1f6',
          200: '#e9e5ed',
          300: '#d8d1de',
          400: '#c0b4ca',
          500: '#a595b3',
          600: '#8B7AA1',
          700: '#7a6b8a',
          800: '#665a72',
          900: '#554c5e',
          950: '#36303c',
        },
        // Core bakery brand colors
        'bakery': {
          cream: '#faf7f2',
          'cream-dark': '#f5f1ea',
          brown: '#8b4513',
          'brown-light': '#a0572a',
          'brown-dark': '#6b3410',
          gold: '#d4a574',
          'gold-light': '#e0b888',
          'gold-dark': '#c1925e',
          warm: '#f4e6d7',
          'warm-dark': '#e8d1b8',
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'bakery': '0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)',
        'bakery-lg': '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)',
        'location': '0 8px 25px -5px rgba(90, 159, 168, 0.1), 0 8px 10px -6px rgba(90, 159, 168, 0.1)',
        'warm': '0 4px 6px -1px rgba(244, 230, 215, 0.4), 0 2px 4px -1px rgba(244, 230, 215, 0.3)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
      },
      animation: {
        // Entrance animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-in-bounce': 'scaleInBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        
        // Loading animations
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        
        // Interactive animations
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        
        // Order status animations
        'order-pulse': 'orderPulse 2s ease-in-out infinite',
        'delivery-move': 'deliveryMove 3s ease-in-out infinite',
        'success-bounce': 'successBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        // Entrance animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleInBounce: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Interactive animations
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.6)' },
        },
        
        // Order-specific animations
        orderPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(90, 159, 168, 0.4)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 0 8px rgba(90, 159, 168, 0)',
            transform: 'scale(1.02)',
          },
        },
        deliveryMove: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '25%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
        successBounce: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'bakery': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}