import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Fail-fast validation at boot
if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, "utf-8").length !== 32) {
  console.error("CRITICAL ERROR: ENCRYPTION_KEY is missing or not 32 bytes long.");
  console.error("Please set a 32-byte ENCRYPTION_KEY in your .env file.");
  process.exit(1);
}

const keyBuffer = Buffer.from(ENCRYPTION_KEY, "utf-8");
const ALGORITHM = "aes-256-gcm";

export function encryptPassword(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
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
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt password:", error);
    return "Error al desencriptar";
  }
}
