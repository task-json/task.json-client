import { TaskJson } from "task.json";

export declare class HttpError extends Error {
	public status: number;
	constructor(status: number, message: string);
}

export declare class Client {
	server: string;
	token?: string;

	constructor(server: string, token?: string);

	login(password: string): Promise<void>;
	
	logout(): Promise<void>;

	sync(taskJson: TaskJson): Promise<TaskJson>;

	download(): Promise<TaskJson>;
	
	upload(taskJson: TaskJson): Promise<void>;
}
