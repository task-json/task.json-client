import * as openpgp from "openpgp";

export async function encrypt(data: string, password: string) {
  const message = await openpgp.createMessage({
    text: data,
    format: "utf8"
  });
  const encrypted = await openpgp.encrypt({
    message,
    passwords: [password]
  });
  return encrypted;
}

export async function decrypt(encrypted: string, password: string) {
  const message = await openpgp.readMessage({
    armoredMessage: encrypted
  });
  const { data } = await openpgp.decrypt({
    message,
    passwords: [password],
    format: "utf8"
  });
  return data as string;
}

