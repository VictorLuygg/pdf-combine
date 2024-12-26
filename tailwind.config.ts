import { type Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: 'hsl(var(--primary))',
                destructive: 'hsl(var(--destructive))',
            },
        },
    },
} satisfies Config;
