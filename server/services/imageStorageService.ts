import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'images');

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.error('[ImageStorage] Failed to create uploads directory:', err);
}

/**
 * Saves a base64 image or returns an existing HTTP/S URL.
 * Storing reference paths prevents bloat in MongoDB documents.
 */
export async function saveImageReference(
  imageStr: string,
  prefix: 'orig' | 'gen' | 'var' = 'gen'
): Promise<string> {
  if (!imageStr) return '';

  // If already an external HTTP/HTTPS URL, return directly
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }

  // If already an internal image route, return as is
  if (imageStr.startsWith('/api/images/')) {
    return imageStr;
  }

  // Handle data URI or raw base64
  let mimeType = 'image/jpeg';
  let extension = 'jpg';
  let base64Data = imageStr;

  if (imageStr.startsWith('data:')) {
    const matches = imageStr.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('webp')) extension = 'webp';
      else extension = 'jpg';
    } else {
      // Fallback
      const commaIdx = imageStr.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = imageStr.slice(commaIdx + 1);
      }
    }
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `${prefix}_${Date.now()}_${randomHex}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.promises.writeFile(filePath, buffer);
    return `/api/images/${filename}`;
  } catch (err: any) {
    console.error('[ImageStorage] Error writing image to disk:', err?.message || err);
    // If saving to disk fails, return imageStr (or fallback)
    return imageStr;
  }
}

/**
 * Resolve an image file path safely, guarding against directory traversal.
 */
export function getStoredImagePath(filename: string): { filePath: string; mimeType: string } | null {
  // Sanitize filename to alphanumeric, underscore, dot, hyphen
  const safeFilename = path.basename(filename);
  if (!/^[a-zA-Z0-9_.-]+$/.test(safeFilename)) {
    return null;
  }

  const filePath = path.join(UPLOADS_DIR, safeFilename);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  let mimeType = 'image/jpeg';
  if (safeFilename.endsWith('.png')) mimeType = 'image/png';
  else if (safeFilename.endsWith('.webp')) mimeType = 'image/webp';

  return { filePath, mimeType };
}
