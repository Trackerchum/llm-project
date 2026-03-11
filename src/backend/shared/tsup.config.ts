import { defineConfig } from "tsup";
import { BuildOptions } from "esbuild";

export default defineConfig((options) => {
	const isDev = options.env?.["NODE_ENV"] === "dev";
	return {
		entry: ["src/index.ts"],
		target: "node22",
		platform: "node",
		format: ["cjs"],
		outDir: undefined,
		esbuildOptions: (options: BuildOptions) => {
			options.outfile = "build/server.js";
		},
		sourcemap: true,
		watch: isDev,
		noExternal: [/(.*)/],
	};
});
