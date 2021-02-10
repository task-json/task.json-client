import axios, { AxiosError } from "axios";
import { TaskJson } from "task.json";

export class HttpError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
};

function handleError(error: AxiosError): never {
	if (error.response) {
		throw new HttpError(error.response.status, error.response.data);
	}
	else {
		throw new HttpError(503, "No response from server");
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
		catch (error) {
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
		catch (error) {
			handleError(error);
		}
	}

	async sync(taskJson: TaskJson): Promise<TaskJson> {
		try {
			const { data } = await axios.patch(this.server, taskJson, {
				headers: { "Authorization": `Bearer ${this.token}` }
			});
			return data as TaskJson;
		}
		catch (error) {
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
		catch (error) {
			handleError(error);
		}
	}
	
	async upload(taskJson: TaskJson): Promise<void> {
		try {
			await axios.patch(this.server, taskJson, {
				headers: { "Authorization": `Bearer ${this.token}` }
			});
		}
		catch (error) {
			handleError(error);
		}
	}
};
