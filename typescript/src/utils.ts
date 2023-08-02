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


import { X509Certificate } from "node:crypto";
import axios from "axios";

/**
 * Get X509 certificate of the server
 * (Only works in Node.js)
 * 
 * @param server Server URL
 * @returns X509Certificate
 */
export async function getCertificate(serverUrl: string): Promise<X509Certificate | undefined> {
  let req: any;
  try {
    const https = await import("https");
    // Use a new axios instance because only the first request of the connection
    // does the server provide certificate
    const resp = await axios.head(serverUrl, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    req = resp.request;
  }
  catch (err: any) {
    req = err.request;
  }
  return req?.socket?.getPeerX509Certificate();
}
