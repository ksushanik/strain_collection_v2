import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp'
]);

export async function validateImageBuffer(buffer: Buffer): Promise<string | null> {
  const result = await fileTypeFromBuffer(buffer);
  if (!result || !ALLOWED_MIME_TYPES.has(result.mime)) return null;
  return result.mime; // returns detected MIME type
}

export function safeExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  return map[mime] ?? '.bin';
}
