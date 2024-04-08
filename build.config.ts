import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	entries: [
		{
			builder: "mkdist",
			input: "./src",
			outDir: "./build",
			declaration: true,
			ext: "js"
		},
	],
	declaration: true,
});