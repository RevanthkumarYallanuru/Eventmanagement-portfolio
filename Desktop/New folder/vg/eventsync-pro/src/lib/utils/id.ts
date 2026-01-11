// Utility functions for generating unique IDs

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomPart}` : `${timestamp}-${randomPart}`;
}

export function generateQRCode(guestId: string, eventId: string): string {
  // Create a unique, encrypted-like QR code string
  const data = `${guestId}|${eventId}|${Date.now()}`;
  // Simple base64-like encoding (in production, use proper encryption)
  return btoa(data).replace(/=/g, '').substring(0, 32);
}

export function decodeQRCode(qrCode: string): { guestId: string; eventId: string } | null {
  try {
    // Pad the string if needed for base64 decoding
    const padded = qrCode + '=='.substring(0, (4 - qrCode.length % 4) % 4);
    const decoded = atob(padded);
    const [guestId, eventId] = decoded.split('|');
    if (guestId && eventId) {
      return { guestId, eventId };
    }
    return null;
  } catch {
    return null;
  }
}
