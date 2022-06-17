import { initTaskJson, isTaskJson } from "task.json";
import { Client, setupClient } from "../lib";
import { X509Certificate } from "node:crypto";

describe("Connect to HTTP Server", () => {
	let client: Client;
	
	test("setup client", async () => {
		client = await setupClient({
			server: "http://localhost:3000"
		});
	});

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

// Self-signed cert
describe("Connect to HTTPS Server", () => {
	let client1: Client;
	let client2: Client;
	
	test("setup client 1", async () => {
		client1 = await setupClient({
			server: "https://localhost:8000"
		});
	});

	test("reject self-signed cert", async () => {
		await expect(client1.login("admin")).rejects.toThrow();
	});
	
	let cert: X509Certificate | undefined;
	test("get certificate", async () => {
		cert = await client1.getCertificate();
		expect(cert).toBeTruthy();
	})

	test("setup client 2", async () => {
		client2 = await setupClient({
			server: "https://localhost:8000",
			ca: cert?.toString()
		});
	});

	test("valid login", async () => {
		await client2.login("admin");
	});

	test("get certificate", async () => {
		const cert = await client2.getCertificate();
		console.log(cert?.fingerprint);
		expect(cert).toBeTruthy();
	})
});
