import { initTaskJson, isTaskJson } from "task.json";
import { Client } from "../lib";

describe("Client API", () => {
	const client = new Client("http://localhost:3000");

	test("invalid login", async () => {
		await expect(client.login("test")).rejects.toThrow();
	});

	test("valid login", async () => {
		await client.login("admin");
	});

	test("download", async () => {
		const tj = await client.download();
		expect(isTaskJson(tj)).toBe(true);
	});

	test("sync", async () => {
		const tj1 = initTaskJson();
		const { data: tj2 } = await client.sync(tj1);
		expect(isTaskJson(tj2)).toBe(true);
	});


	test("upload", async () => {
		const tj1 = initTaskJson();
		await client.upload(tj1);
	});

	test("logout", async () => {
		await client.logout();
	});
});
