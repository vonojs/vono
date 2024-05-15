import rpc from "#vono/rpc";
import "server-only";

export const getUser = rpc((idx?: string) => {
	console.log("uh oh");
	return "lol";
});

export class Users {
	getUsers() {
		return "LOL";
	}
	getUserById(id: string) {
		return id;
	}
}
