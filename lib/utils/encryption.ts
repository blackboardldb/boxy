import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
let keyBuffer: Buffer | null = null;

function getKey(): Buffer {
  if (keyBuffer) return keyBuffer;
  const key = process.env.ENCRYPTION_KEY;
  if (!key || Buffer.from(key, "utf-8").length !== 32) {
    throw new Error("CRITICAL ERROR: ENCRYPTION_KEY is missing or not 32 bytes long. Please set a 32-byte ENCRYPTION_KEY in your environment variables.");
  }
  keyBuffer = Buffer.from(key, "utf-8");
  return keyBuffer;
}

export function encryptPassword(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

export function decryptPassword(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return "Error: formato inválido";
    
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], "hex");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt password:", error);
    return "Error al desencriptar";
  }
}
