/**
 * Copyright (C) 2021-2023  DCsunset
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/> 
 */


import { initTaskJson, isTaskJson } from "task.json";
import { Client, setupClient, getCertificate } from "../lib";
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
	const server = "https://localhost:8000";
	
	test("setup client 1", async () => {
		client1 = await setupClient({ server });
	});

	test("reject self-signed cert", async () => {
		await expect(client1.login("admin")).rejects.toThrow();
	});
	
	let cert: X509Certificate | undefined;
	test("get certificate", async () => {
		cert = await getCertificate(server);
		expect(cert).toBeTruthy();
	})

	test("setup client 2", async () => {
		client2 = await setupClient({
			server,
			ca: cert?.toString()
		});
	});

	test("valid login", async () => {
		await client2.login("admin");
	});
});
