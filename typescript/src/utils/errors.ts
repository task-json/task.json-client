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
    const resp = error.response.data as any;
    const msg = typeof resp?.message === "string" ? resp.message : resp;
    throw new HttpError(error.response.status, msg);
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

export function handleError(error: any): never {
  if (error instanceof AxiosError) {
    handleAxiosError(error)
  }
  else if (error instanceof HttpError) {
    throw error;
  }
  else {
    throw new HttpError(500, error.message);
  }
}
