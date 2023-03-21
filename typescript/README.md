# task.json-client

[![npm version](https://badgen.net/npm/v/task.json-client)](https://www.npmjs.com/package/task.json-client)
[![license](https://badgen.net/npm/license/task.json-client)](https://www.npmjs.com/package/task.json-client)

TypeScript library to interact with [task.json-server](https://github.com/DCsunset/task.json-server).

## Installation

```
npm i task.json-client
```

## Usage

```js
import { setupClient } from "task.json-client";

async function main() {
  const client = new setupClient({
    server: "http://localhost:3000"
  });
  await client.login("admin");
  const tj1 = await client.download();
  const tj2 = await client.sync(tj1);
  await client.upload(tj2);
  await client.logout();
}
```

For a self-signed certificate,
the browser will handle it directly.
If used in Node.js, `verify` and `ca` flags can be used:

```js
// Use verify flag
import { setupClient } from "task.json-client";

async function main() {
  const client = new setupClient({
    server: "https://localhost:3000",
    // Do not verify the certificate
    // (less secure than trusting the certificate)
    verify: false
  });
  await client.login("admin");
}
```

```js
// Use ca flag (only works in Node.js)
import { setupClient, getCertificate } from "task.json-client";

async function main() {
  const server = "https://localhost:3000";
  const cert = await getCertificate(server);
  // Verify the certificate (e.g. by fingerprint)
  // ...

  const client = new setupClient({
    server,
    // Trust this certificate
    ca: cert.toString()
  });
  await client.login("admin");
}
```

## License

All code licensed under AGPL-3.0. Full copyright notice:

    Copyright (C) 2021-2023  DCsunset

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
