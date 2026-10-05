import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // Standard 128-bit Auth Tag

function getKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_SECRET ||
    "default-super-secret-key-32-chars-long!!";
  // Create a 32-byte key using sha256 to ensure exact 256 bits regardless of input format
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * Returns formatted string: ivHex:authTagHex:encryptedHex
 */
export function encryptPassword(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted string produced by encryptPassword
 */
export function decryptPassword(cipherPayload: string): string {
  if (!cipherPayload) return "";
  
  const parts = cipherPayload.split(":");
  if (parts.length !== 3) {
    // If for any legacy reason it's plaintext
    return cipherPayload;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
