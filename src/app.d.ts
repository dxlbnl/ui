declare global {
	namespace App {}
}

// Allow CSS side-effect imports (handled by Vite at runtime)
declare module '*.css' {}

export {};
