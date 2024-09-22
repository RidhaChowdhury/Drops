/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',  // Add paths where you use Tailwind CSS
		],	
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {}
		}
	},
	plugins: [require("tailwindcss-animate")],
}

