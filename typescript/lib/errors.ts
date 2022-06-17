import { AxiosError } from "axios";

export class HttpError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
};

export function handleAxiosError(error: AxiosError): never {
	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx	
		throw new HttpError(error.response.status, error.response.data as string);
	}
	else if (error.request) {
		// The request was made but no response was received
		throw new HttpError(503, error.message);
	}
	else {
		// Something happened in setting up the request that triggered an Error
		throw new HttpError(500, error.message);
	}
}
