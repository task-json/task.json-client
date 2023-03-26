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


import { Client, setupClient, getCertificate } from "../src/index.js";
import { X509Certificate } from "node:crypto";
import { TaskJson } from "task.json";

describe("Connect to HTTP Server", () => {
	let client: Client;
	const tj1: TaskJson = [
		{
			id: "1",
			status: "todo",
			text: "Hello, world 1",
			created: new Date("2000-01-01").toISOString(),
			modified: new Date("2010-07-07").toISOString(),
		}
	];
	const tj2: TaskJson = [
		{
			id: "2",
			status: "todo",
			text: "Hello, world 1",
			created: new Date("2000-01-01").toISOString(),
			modified: new Date("2010-07-07").toISOString(),
		}
	];

	const encryptionKeys = [undefined, "abc"];

	for (const key of encryptionKeys) {
		test("setup client", async () => {
			client = await setupClient({
				server: "http://localhost:3000",
				encryptionKey: key
			});
		});

		test("invalid login", async () => {
			await expect(client.login("test")).rejects.toThrow();
		});

		test("valid login", async () => {
			await client.login("admin");
		});

		test("upload", async () => {
			const tj1: TaskJson = [
				{
					id: "1",
					status: "todo",
					text: "Hello, world 1",
					created: new Date("2000-01-01").toISOString(),
					modified: new Date("2010-07-07").toISOString(),
				}
			];
			await client.upload(tj1);
		});

		test("download", async () => {
			const { data } = await client.download();
			expect(data).toEqual(tj1);
		});


		test("sync", async () => {
			const { data } = await client.sync(tj2);
			expect(data.map(t => t.id).sort()).toEqual(["1", "2"]);
		});

		test("download", async () => {
			const { data }=  await client.download();
			expect(data.map(t => t.id).sort()).toEqual(["1", "2"]);
		});

		test("delete", async () => {
			await client.delete();
		});
	}
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
