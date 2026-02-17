import { defineConfig } from "tsup";

export default defineConfig((options) => {
	const isDev = options.env?.["NODE_ENV"] === "dev";
	return {
		entry: ["src/index.ts"],
		outDir: undefined,
		esbuildOptions: (options) => {
			options.outfile = "build/server.js";
		},
		sourcemap: true,
		watch: isDev,
		noExternal: [/(.*)/],
	};
});
