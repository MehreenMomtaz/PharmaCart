import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString("hex")}`;
};

export const verifyPassword = async (password, storedHash) => {
  if (!storedHash || !storedHash.startsWith("scrypt$")) return false;

  const [, salt, storedKeyHex] = storedHash.split("$");
  if (!salt || !storedKeyHex) return false;

  const storedKey = Buffer.from(storedKeyHex, "hex");
  const derivedKey = Buffer.from(await scrypt(password, salt, storedKey.length));

  if (storedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKey, derivedKey);
};
