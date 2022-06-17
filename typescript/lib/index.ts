import axios, { AxiosError } from "axios";
import { TaskJson, DiffStat } from "task.json";

export class HttpError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
};

function handleError(error: AxiosError): never {
	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx	
		throw new HttpError(error.response.status, error.response.data);
	}
	else if (error.request) {
		// The request was made but no response was received
		throw new HttpError(503, "No response from server");
	}
	else {
		// Something happened in setting up the request that triggered an Error
		throw new HttpError(500, error.message);
	}
}

export class Client {
	server: string;
	token?: string;

	constructor(server: string, token?: string) {
		this.server = server;
		this.token = token;
	}

	async login(password: string): Promise<void> {
		try {
			const { data } = await axios.post(`${this.server}/session`, {
				password
			});
			this.token = data.token;
		}
		catch (error: any) {
			handleError(error);
		}
	}
	
	async logout(): Promise<void> {
		try {
			await axios.delete(`${this.server}/session`, {
				headers: { "Authorization": `Bearer ${this.token}` }
			});
			this.token = undefined;
		}
		catch (error: any) {
			handleError(error);
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
			const { data } = await axios.patch(this.server, taskJson, {
				headers: { "Authorization": `Bearer ${this.token}` }
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
			handleError(error);
		}
	}

	async download(): Promise<TaskJson> {
		try {
			const { data } = await axios.get(this.server, {
				headers: { "Authorization": `Bearer ${this.token}` }
			});
			return data as TaskJson;
		}
		catch (error: any) {
			handleError(error);
		}
	}
	
	async upload(taskJson: TaskJson): Promise<void> {
		try {
			await axios.patch(this.server, taskJson, {
				headers: { "Authorization": `Bearer ${this.token}` }
			});
		}
		catch (error: any) {
			handleError(error);
		}
	}
};
