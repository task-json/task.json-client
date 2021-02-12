# task.json-client

[![npm version](https://badgen.net/npm/v/task.json-client)](https://www.npmjs.com/package/task.json-client)
[![license](https://badgen.net/npm/license/task.json-client)](https://www.npmjs.com/package/task.json-client)

Typescript library to interact with [task.json-server](https://github.com/DCsunset/task.json-server).

## Installation

```
npm i task.json-client
```

## Usage

```js
async function main() {
	const client = new Client("http://localhost:3000");
  await client.login("admin");
  const tj1 = await client.download();
  const tj2 = await client.sync(tj1);
  await client.upload(tj2);
  await client.logout();
}
```

## License

GPL-3.0 License
