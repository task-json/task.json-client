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

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { TaskJson, DiffStat } from "task.json";
import normalizeUrl from "normalize-url";
import { handleAxiosError } from "./errors.js";

// Re-export
export * from "./errors.js";
export * from "./utils.js";

export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ClientConfig = {
	/// Server URL
	server: string,
	/// Token to log into server
	token?: string;
	/**
	 * Verify cert chain when using https (default: true)
	 * 
	 * (Only works in Node.js when verify set to false)
	 */
	verify?: boolean;
	/**
	 * Trusted CA certificates for verification in PEM format
	 * It will overwrite all default CAs
	 * 
	 * verify should be set to true for this to take effect
	 * (Only works in Node.js)
	 */
	ca?: string | Buffer | (string | Buffer)[]
};

export class Client {
	config: RequireField<ClientConfig, "verify">;
	axios: AxiosInstance;

	constructor(config: RequireField<ClientConfig, "verify">, axiosInstance: AxiosInstance) {
		this.config = config;
		this.axios = axiosInstance;
	}

	/**
	 * Convert relative path to normalized full path
	 * 
	 * @param path Relative path
	 * @returns Full path
	 */
	fullPath(path: string): string {
		return normalizeUrl(`${this.config.server}/${path}`);
	}

	async login(password: string): Promise<void> {
		try {
			const { data } = await this.axios.post(this.fullPath("session"), {
				password
			});
			this.config.token = data.token;
		}
		catch (error: any) {
			handleAxiosError(error);
		}
	}
	
	async logout(): Promise<void> {
		try {
			await this.axios.delete(this.fullPath("session"), {
				headers: { "Authorization": `Bearer ${this.config.token}` }
			});
			this.config.token = undefined;
		}
		catch (error: any) {
			handleAxiosError(error);
		}
	}

	async sync(taskJson: TaskJson): Promise<{
		data: TaskJson,
		stat: {
			client: DiffStat,
			server: DiffStat
		}
	}> {
		try {
			const { data } = await this.axios.patch(this.fullPath("/"), taskJson, {
				headers: { "Authorization": `Bearer ${this.config.token}` }
			});
			return data as {
				data: TaskJson,
				stat: {
					client: DiffStat,
					server: DiffStat
				}
			};
		}
		catch (error: any) {
			handleAxiosError(error);
		}
	}

	async download(): Promise<TaskJson> {
		try {
			const { data } = await this.axios.get(this.fullPath("/"), {
				headers: { "Authorization": `Bearer ${this.config.token}` }
			});
			return data as TaskJson;
		}
		catch (error: any) {
			handleAxiosError(error);
		}
	}
	
	async upload(taskJson: TaskJson): Promise<void> {
		try {
			await this.axios.patch(`${this.config.server}/`, taskJson, {
				headers: { "Authorization": `Bearer ${this.config.token}` }
			});
		}
		catch (error: any) {
			handleAxiosError(error);
		}
	}
};

export async function setupClient(config: ClientConfig): Promise<Client> {
	const mergedConfig: RequireField<ClientConfig, "verify"> = {
		verify: true,
		...config
	};

	let axiosConfig: AxiosRequestConfig | undefined;
	if (!mergedConfig.verify) {
		// Only works in Node.js
		const https = await import("https");
		axiosConfig = {
			httpsAgent: new https.Agent({
				rejectUnauthorized: false,
			})
		};
	}
	else if (mergedConfig.ca) {
		// Only works in Node.js
		const https = await import("https");
		axiosConfig = {
			httpsAgent: new https.Agent({
				ca: mergedConfig.ca
			})
		};
	}

	const axiosInstance = axios.create(axiosConfig);
	return new Client(mergedConfig, axiosInstance);
}
