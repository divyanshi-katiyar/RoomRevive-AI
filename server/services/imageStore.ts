interface TempImageItem {
  id: string;
  buffer: Buffer;
  mimeType: string;
  createdAt: number;
}

const tempImageMap = new Map<string, TempImageItem>();

// Periodically clean up items older than 30 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [id, item] of tempImageMap.entries()) {
    if (now - item.createdAt > 30 * 60 * 1000) {
      tempImageMap.delete(id);
    }
  }
}, 5 * 60 * 1000);

if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

export function storeTempImage(id: string, buffer: Buffer, mimeType: string): void {
  tempImageMap.set(id, {
    id,
    buffer,
    mimeType,
    createdAt: Date.now(),
  });
}

export function getTempImage(id: string): TempImageItem | undefined {
  return tempImageMap.get(id);
}
