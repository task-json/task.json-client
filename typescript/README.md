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

GPL-3.0 License
