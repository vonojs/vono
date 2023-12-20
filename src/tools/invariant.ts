class AssertionError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "AssertionError";
	}
}

export function assert(value: boolean, message?: string): asserts value;

export function assert<T>(
	value: T | null | undefined,
	message?: string
): asserts value is T;

export function assert(value: any, message?: string) {
	if (value === false || value === null || typeof value === "undefined") {
		throw new AssertionError(message);
	}
  return value;
}
