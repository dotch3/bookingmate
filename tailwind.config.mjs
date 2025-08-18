/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	mode: 'jit',
	purge: false,
	safelist: [
		// Gradient backgrounds
		'bg-gradient-to-r',
		'from-slate-800',
		'via-slate-700',
		'to-slate-800',
		'from-blue-400',
		'to-cyan-400',
		'from-blue-500',
		'to-cyan-500',
		'from-red-500',
		'to-red-600',
		'hover:from-red-600',
		'hover:to-red-700',
		// Text gradients
		'bg-clip-text',
		'text-transparent',
		// Colors and effects
		'text-white',
		'text-slate-100',
		'text-slate-300',
		'bg-blue-600',
		'shadow-xl',
		'shadow-lg',
		'shadow-md',
		'shadow-blue-600/25',
		'hover:shadow-xl',
		'border-slate-600',
		// Hover effects
		'hover:-translate-y-0.5',
		'hover:bg-slate-600',
		'hover:text-blue-300',
		// Layout
		'flex',
		'justify-between',
		'items-center',
		'px-6',
		'py-4',
		'space-x-8',
		'space-x-4',
		'space-x-1'
	],
	theme: {
		extend: {
			// Force rebuild
		},
	},
	plugins: [],
};
