export const code = (...content: string[]) => content.join("\n");
export const block = (...content: string[]) => `{
	${content.join("\n")}
}`;
export const array = (...content: string[]) => `[${content.join(", ")}]`;
export const tab = (content: string) =>
	content
		.split("\n")
		.map((line) => "  " + line)
		.join("\n");

