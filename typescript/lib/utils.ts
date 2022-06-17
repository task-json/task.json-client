import { X509Certificate } from "crypto";
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
