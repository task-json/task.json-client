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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { TaskJson, DiffStat, mergeTaskJson, compareMergedTaskJson, serializeTaskJson, deserializeTaskJson } from "task.json";
import normalizeUrl from "normalize-url";
import { handleError } from "./utils/errors.js";
import { decrypt, encrypt } from "./utils/crypto.js";

// Re-export
export * from "./utils/errors.js";
export * from "./utils.js";

export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ClientConfig = {
  /// Server URL
  server: string,
  /// Token to log into server
  token?: string,
  /**
   * Verify cert chain when using https (default: true)
   * 
   * (Only works in Node.js when verify set to false)
   */
  verify?: boolean,
  /**
   * Trusted CA certificates for verification in PEM format
   * It will overwrite all default CAs
   * 
   * verify should be set to true for this to take effect
   * (Only works in Node.js)
   */
  ca?: string | Buffer | (string | Buffer)[],

  /**
   * Max retries to make when there's conflicting updates
   * If undefined, won't retry automatically
   */
  maxRetries?: number;
  /**
   * Key to encrypt the data before sending to the server
   * If undefined, data won't be encrypted
   */
  encryptionKey?: string
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
      handleError(error);
    }
  }
  
  async logout() {
    try {
      await this.axios.delete(this.fullPath("session"), {
        headers: { "Authorization": `Bearer ${this.config.token}` }
      });
      this.config.token = undefined;
    }
    catch (error: any) {
      handleError(error);
    }
  }

  async sync(data: TaskJson) {
    try {
      // Upload back to server using the same expected version number
      let { data: serverData, version } = await this.download();

      for (let i = 0; ; ++i) {
        try {
          const merged = mergeTaskJson(data, serverData);
          await this.upload(merged, version);

          const clientDiff = compareMergedTaskJson(data, merged);
          const serverDiff = compareMergedTaskJson(serverData, merged);

          return {
            data: merged,
            diff: {
              client: clientDiff,
              server: serverDiff
            }
          };
        }
        catch (err) {
          if (err instanceof AxiosError && err.response?.status === 409 && i < (this.config.maxRetries ?? 0)) {
            const resp = err.response.data;
            console.assert("data" in resp && "version" in resp, `Invalid error response from server: ${resp}`);
            // Conflicting updates, retry using new data
            ({ data: serverData, version } = resp);
          }
          else {
            throw err;
          }
        }
      }
    }
    catch (error: any) {
      handleError(error);
    }
  }

  async download() {
    try {
      let { data: { data, version } } = await this.axios.get(this.fullPath("/"), {
        headers: { "Authorization": `Bearer ${this.config.token}` },
      });
      if (data && this.config.encryptionKey) {
        // Decrypt data
        data = await decrypt(data, this.config.encryptionKey);
      }
      try {
        const tasks = data ? deserializeTaskJson(data) : [];
        return {
          data: tasks,
          version: version as number
        };
      }
      catch (_err: any) {
        throw new Error("Data corrupted or encrypted");
      }
    }
    catch (error: any) {
      handleError(error);
    }
  }

  /// Version number used for concurrency control (-1 means overwriting)
  async upload(data: TaskJson, version: number = -1) {
    try {
      let serialized = serializeTaskJson(data);
      if (this.config.encryptionKey) {
        serialized = await encrypt(serialized, this.config.encryptionKey);
      }
      await this.axios.put(this.fullPath("/"), {
        data: serialized,
        version
      }, {
        headers: { "Authorization": `Bearer ${this.config.token}` }
      });
    }
    catch (error: any) {
      handleError(error);
    }
  }

  async delete() {
    try {
      await this.axios.delete(this.fullPath("/"), {
        headers: { "Authorization": `Bearer ${this.config.token}` }
      });
    }
    catch (error: any) {
      handleError(error);
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
